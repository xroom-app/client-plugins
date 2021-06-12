import * as React from 'preact'

export default ({size, style}) =>
  <svg width={size} height={size * 97 / 140} viewBox="0 0 140 97" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="0.25" y="0.25" width="139.5" height="96.5" rx="4.75" stroke="var(--box-1)" strokeWidth="0.5"/>
    <rect x="5.25" y="6.25" width="106.5" height="5.5" rx="2.75" stroke="var(--box-1)" strokeWidth="0.5"/>
    <rect x="117" y="6" width="18" height="6" rx="3" fill="white"/>
  </svg>
