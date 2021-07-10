import test from 'ava';

import {Config, Connection} from '../../src/Illuminate/Database';
import {Builder} from '../../src/Illuminate/Database/Query';
import {Grammar} from '../../src/Illuminate/Database/Query/Grammars';
import {Processor} from '../../src/Illuminate/Database/Query/Processors';

const config: Config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root',
};

const getConnection = () => new Connection(config);

const getBuilder = () => {
  const grammar = new Grammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

test('testBasicSelect', t => {
  const builder = getBuilder();
  builder.select('*').from('users');

  t.is(builder.toSql(), 'select * from "users"');
});

// test('test_name', (t) => {

// });
