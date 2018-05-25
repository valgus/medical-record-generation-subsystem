
import React, { Component } from 'react'

import Inputs from '../Inputs.jsx'

class UpdateQuestion extends Component {
  render() {
    const question = this.props.question;
    return (
      <div>
        <div className="field is-horizontal">
          <div className="field-label is-small">
            <label className="label">Question</label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control">
               <input className="input input-variable  is-small" type="text" placeholder="Type question here." value={this.props.newQuestion.name} onChange={this.props.changeNewQuestionName} />
             </p>
            </div>
          </div>
        </div>
        <div className="field is-horizontal">
          <div className="field-label is-small">
            <label className="label">Question type</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <div className="select is-small">
                  <select value={this.props.newQuestion.type} onChange={this.props.changeNewQuestionType}>
                    <option value="0">Text</option>
                    <option value="1">Number</option>
                    <option value="2">Single choice</option>
                    <option value="3">Multiple choice</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        {[2,3].includes(this.props.newQuestion.type) && <Inputs arr={this.props.newQuestion.options} enabled={true} onDelete={this.props.deleteOption} onAdd={this.props.addNewOption} onChange={this.props.changeOption}/>}
        {this.props.renderLink()}
        <div className="field is-grouped mt-20">
          <p className="control">
            <a className="button is-small is-light"  onClick={this.props.showQuestion}>Cancel</a>
          </p>
          <p className="control">
            <a className="button is-small is-info" onClick={this.props.saveQuestion}>Add</a>
          </p>
        </div>
      </div>
      );
  }
}

export default UpdateQuestion
