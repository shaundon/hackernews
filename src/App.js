import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      query: DEFAULT_QUERY,
      searchKey: '',
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.shouldSearchTopStories = this.shouldSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  shouldSearchTopStories(query) {
    return !this.state.results[query];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey } = this.state;

    const oldHits = page === 0 ? [] : this.state.results[searchKey].hits;
    const updatedHits = [...oldHits, ...hits];

    this.setState({
      results: {
        ...this.state.results,
        [searchKey]: {
          hits: updatedHits,
          page
        }
      },
      isLoading: false
    });
  }

  fetchSearchTopStories(query, page) {
    this.setState({ isLoading: true });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
    ;
  }

  onSearchChange(event) {
    this.setState({query: event.target.value});
  }

  onSearchSubmit(event) {
    const { query } = this.state;
    this.setState({ searchKey: query });
    if (this.shouldSearchTopStories(query)) {
      this.fetchSearchTopStories(query, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse })
  }

  // Run at component launch. Initialise with a default query.
  componentDidMount() {
    const { query } = this.state;
    this.setState({ searchKey: query });
    this.fetchSearchTopStories(query, DEFAULT_PAGE);
  }

  render() {
    const { query, results, searchKey, isLoading, sortKey, isSortReverse } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search value={query} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        <Table list={list} sortKey={sortKey} onSort={this.onSort} isSortReverse={isSortReverse} />
        <div className="interactions">
          <ButtonWithLoading isLoading={isLoading} onClick={() => this.fetchSearchTopStories(searchKey, page+1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>

const Table = ({list, sortKey, isSortReverse, onSort}) => {
  const col_lg = {width: '40%'};
  const col_md = {width: '30%'};
  const col_sm = {width: '15%'};

  let sortedList = SORTS[sortKey](list);
  if (isSortReverse) {
    sortedList = sortedList.reverse();
  }

  return (
    <div className="table">
      <div className="table-header">
        <span style={col_lg}>
          <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>Title</Sort>
        </span>
        <span style={col_md}>
          <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>Author</Sort>
        </span>
        <span style={col_sm}>
          <Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>Comments</Sort>
        </span>
        <span style={col_sm}>
          <Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>Points</Sort>
        </span>
      </div>
    { sortedList.map((item) =>
      <div key={item.objectID} className="table-row">
        <span style={col_lg}><a href={item.url}>{item.title}</a></span>
        <span style={col_md}>{item.author}</span>
        <span style={col_sm}>{item.num_comments}</span>
        <span style={col_sm}>{item.points}</span>
      </div>
    )}
  </div>
  );
};

const Sort = ({sortKey, activeSortKey, onSort, children}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );
  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>
      {children}
    </Button>
  );
};

const Button = ({onClick, className, children}) =>
  <button onClick={onClick} type="button" className={className}>
    {children}
  </button>

const Loading = () =>
  <div>Loading...</div>

const withLoading = (Component) => ({ isLoading, ...props }) =>
  isLoading ? <Loading /> : <Component { ...props } />;

const ButtonWithLoading = withLoading(Button);

export default App;

export {
  Button,
  Search,
  Table,
  Loading,
  ButtonWithLoading,
  Sort
};
