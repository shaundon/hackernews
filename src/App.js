import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      query: DEFAULT_QUERY,
      searchKey: '',
    };

    this.shouldSearchTopStories = this.shouldSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
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
      }
    });
  }

  fetchSearchTopStories(query, page) {
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

  // Run at component launch. Initialise with a default query.
  componentDidMount() {
    const { query } = this.state;
    this.setState({ searchKey: query });
    this.fetchSearchTopStories(query, DEFAULT_PAGE);
  }

  render() {
    const { query, results, searchKey } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search value={query} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        <Table list={list} />
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page+1)}>
            More
          </Button>
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

const Table = ({list}) => {
  const col_lg = {width: '40%'};
  const col_md = {width: '30%'};
  const col_sm = {width: '15%'};

  return (
    <div className="table">
    { list.map((item) =>
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

const Button = ({onClick, children}) =>
  <button onClick={onClick} type="button">
    {children}
  </button>

export default App;

export {
  Button,
  Search,
  Table
};
