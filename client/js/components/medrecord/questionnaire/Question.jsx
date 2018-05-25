
import React, { Component } from 'react'


class Question extends Component {
  render() {
    const question = this.props.question;
    return (
      <div className="question mt-10" onMouseOver={this.props.onMouseOver} onMouseOut={this.props.onMouseOut}>
       <nav className="level">
          <div className="level-left"></div>
          <div className="level-right">
            <div className="level-item">
              <a onClick={this.props.edit}><span className={(!this.props.showFunctions)? "icon hidden" : "icon"}><i className="fas fa-edit"></i></span></a>
              <a onClick={this.props.delete}><span className={(!this.props.showFunctions)? "icon hidden" : "icon"}><i className="fas fa-times-circle"></i></span></a>
            </div>
          </div>
        </nav>
        <nav className="level">
          <div className="level-left">
            <p className="level-item title is-6 mb-5 question-title">{this.props.index}. {question.name}</p>
          </div>
          { this.props.link &&
            <div className="level-right">
              <p className="level-item link">(Is connected to question: {this.props.link})</p>
            </div>
          }
        </nav>
        <nav className="level">
          <div className="level-left" style={{width: "60%"}}>
            <div className="level-item" style={ (question.type === 0) ? {width: "100%"} : {}}>
              {
                (question.type === 0) &&
                <input  className="input  is-small" type="text"/>
              }
              {
                (question.type === 1) &&
                <input  className="input is-small" type="number"/>
              }
              {
                (question.type === 2) &&
                (<p className="control">
                {question.options.map((option, index) => {
                  return (
                    <label className="radio" key={index}>
                      <input className="is-small" type="radio" name="answer"/>
                      {option}
                    </label>
                  )
                })}
              </p>)
              }
              {
                (question.type === 3) &&
                (<p className="control">
                {question.options.map((option, index) => {
                  return (
                    <label className="checkbox is-small" key={index}>
                      <input type="checkbox" className="is-small"/>
                      {option}
                    </label>
                  )
                })}
              </p>)
              }
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <a onClick={this.props.up}><span className={(!this.props.showFunctions)? "icon hidden" : "icon arrows"}><i className="fas fa-arrow-alt-circle-up"></i></span></a>
              <a onClick={this.props.down}><span className={(!this.props.showFunctions)? "icon hidden" : "icon arrows"}><i className="fas fa-arrow-alt-circle-down"></i></span></a>
            </div>
          </div>
        </nav>

      </div>
      );
  }
}

export default Question
