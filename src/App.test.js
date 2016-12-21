import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import App from './App';
import { Search, Button, Table } from './App';

function render(el) {
  const div = document.createElement('div');
  ReactDOM.render(el, div);
}

function checkSnapshot(el) {
  const component = renderer.create(el);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
}

describe('App', () => {
  const el = <App />;
  it('renders', () => render(el));
  test('snapshots', () => checkSnapshot(el));
});

describe('Search', () => {
  const el = <Search>Search</Search>;
  it('renders', () => render(el));
  test('snapshots', () => checkSnapshot(el));
});

describe('Button', () => {
  const el = <Button>Load More</Button>;
  it('renders', () => render(el));
  test('snapshots', () => checkSnapshot(el));
});

describe('Table', () => {

  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
    ]
  };

  let el = <Table {...props} />;
  it('renders', () => render(el));
  test('snapshots', () => checkSnapshot(el));

  it('shows two items in list', () => {
    el = shallow(el);
    expect(el.find('.table-row').length).toBe(2);
  })
});
