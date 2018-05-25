
import React, { Component } from 'react'


class Inputs extends Component {
  render() {
    return (
      <div className="inputs-container mb-10">
        {this.props.arr.length === 0 &&   <a className="button is-small is-info" disabled={!this.props.enabled} onClick={this.props.onAdd}>Add value</a>}
        { this.props.arr.map((substr, index) => {
          return (
             (<div className="field is-grouped" key={index}>
             { this.props.ordinal && (<input type="checkbox" checked={this.props.critical[index]}  onChange={() => this.props.handleCritical(index)} />)}
              <p className="control is-expanded">
                <input className="input is-small" disabled={!this.props.enabled} type="text" value={substr} onChange={(e) => this.props.onChange(e, index)}/>
              </p>
              <p className="control">
                <a className="button is-small is-danger" disabled={!this.props.enabled} onClick={() => this.props.onDelete(index)}>
                  Delete this
                </a>
              </p>
              <p className="control">
                <a className="button is-small is-info" disabled={!this.props.enabled} onClick={this.props.onAdd}>
                  Add one more
                </a>
              </p>
            </div>)
          );
        })}
      </div>
      );
  }
}

export default Inputs
