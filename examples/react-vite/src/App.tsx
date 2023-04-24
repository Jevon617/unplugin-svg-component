import './App.css'
import type { SvgName } from '~virtual/svg-component'

import MySvgIcon, { svgNames } from '~virtual/svg-component'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test: SvgName = 'icon-react'

// eslint-disable-next-line no-console
console.log(svgNames)
function App() {
  return (
    <div className="logo">
      <MySvgIcon name='icon-react'></MySvgIcon>
      <MySvgIcon name='icon-icon-card2'></MySvgIcon>
      <MySvgIcon name='icon-icon-addUser'></MySvgIcon>
    </div>
  )
}

export default App
