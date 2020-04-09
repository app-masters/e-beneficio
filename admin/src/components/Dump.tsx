import React from 'react';

const Dump: React.FC<{ [key: string]: any }> = props => (
  <div
    style={{
      fontSize: 20,
      border: '1px solid #efefef',
      padding: 10,
      background: 'white',
    }}
  >
    {Object.entries(props).map(([key, val]) => (
      <pre key={key}>
        <strong style={{ color: 'white', background: 'red' }}>
          {key}{' '}
          <span role="img" aria-label="dump">
            💩
          </span>
        </strong>
        {JSON.stringify(val, undefined, ' ')}
      </pre>
    ))}
  </div>
);

export default Dump;
