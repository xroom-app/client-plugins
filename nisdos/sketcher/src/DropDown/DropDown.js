import React from 'react'
import styles from './styles.module.css'

const DropDownOption = ({option, onClick, isCurrent}) => (
  <div className={styles.option + " " + (isCurrent ? styles.option__current : '')} onClick={() => onClick && onClick(option.key)}>
    {option.icon && <svg className={styles.option__icon} viewBox="0 0 24 24">{option.icon}</svg>}
    {option.value}
  </div>
)

class DropDown extends React.Component {
	constructor(props) {
		super(props)
		this.state = { isOpen: false }
		this.container = React.createRef();
	}

	componentDidMount() {
		document.addEventListener("click", this.toggleOpen);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.toggleOpen);
	}

	toggleOpen = e => {
		if (this.container && this.container.current.contains(e.target)) {
			this.props.options.length > 1 && this.setState({isOpen: !this.state.isOpen});
		} else {
			this.setState({isOpen: false})
		}	  
	}

	render() {
		const { isOpen } = this.state
		const { options, current, onClick, style, size } = this.props
    const currentOption = options.find(i => i.key === current)
		
		return (
      <div
        ref={this.container}
        className={
          styles.drop_down + " " +
          (isOpen ? styles.drop_down__open : '') + " " +
          styles[size]
        }
        style={style}
      >
        <DropDownOption option={currentOption} />
        <svg className={styles.arrow + " " + (isOpen ? styles.arrow__open : '')} viewBox="0 0 24 24">
          <path d="M 7.41,8 12,12.58 16.59,8 18,9.41 l -6,6 -6,-6 z" fill="#cccccc" />
        </svg>
				<div className={styles.container + " " + (isOpen ? styles.container__show : '')}>
					{options.map(option =>
            <DropDownOption
              option={option}
              onClick={key => onClick(key)}
              isCurrent={option.key === current}
            />
          )}
				</div>
			</div>
		)
	}
}

export default DropDown