import * as React from 'preact'
import styles from './styles.module.css'
import cn from 'classnames'

const DropDownOption = ({ option, onClick, isCurrent }) => (
  <div
    className={styles.option + ' ' + (isCurrent ? styles.option__current : '')}
    onClick={() => onClick && onClick(option.key)}
  >
    {option.icon && (
      <svg className={styles.option__icon} viewBox='0 0 24 24'>
        {option.icon}
      </svg>
    )}
    <span className={styles.option__caption}>{option.value}</span>
  </div>
);

class DropDown extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isOpen: false }
    this.container = React.createRef()
  }

  componentDidMount() {
    document.addEventListener('click', this.toggleOpen)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.toggleOpen)
  }

  toggleOpen = e => {
    if (this.container && this.container.current.contains(e.target)) {
      const { options } = this.props
      if (options.length > 1) {
        const dropdownBounds = this.container.current.getBoundingClientRect()
        const documentHeight = document.body.clientHeight
        const isOutOfBounds = documentHeight < (dropdownBounds.y + 50 + (dropdownBounds.height * options.length))

        this.setState({ isOpen: !this.state.isOpen, isInverse: isOutOfBounds })
      }
    } else {
      this.setState({ isOpen: false })
    }
  };

  render() {
    const { isOpen, isInverse } = this.state
    const { options, current, onClick, style, size } = this.props
    const currentOption = options.find((i) => i.key === current)
    console.log('test');

    return (
      <div
        ref={this.container}
        className={cn(styles.drop_down, styles[size], {
          [styles.drop_down__open]: isOpen,
          [styles.drop_down__inverse]: isInverse,
        })}
        style={style}
      >
        <DropDownOption option={currentOption} />
        <svg
          className={styles.arrow + ' ' + (isOpen ? styles.arrow__open : '')}
          viewBox='0 0 24 24'
        >
          <path
            d='M 7.41,8 12,12.58 16.59,8 18,9.41 l -6,6 -6,-6 z'
            fill='#ccc'
          />
        </svg>
        <div
          className={
            styles.container + ' ' + (isOpen ? styles.container__show : '')
          }
        >
          {options.map((option) => (
            <DropDownOption
              option={option}
              onClick={(key) => onClick(key)}
              isCurrent={option.key === current}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default DropDown;
