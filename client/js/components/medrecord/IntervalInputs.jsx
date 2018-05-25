
import React, { Component } from 'react'


class Inputs extends Component {
  render() {
    return (
      <div className="inputs-container">
        {this.props.arr.length === 0 &&   <a className="button is-small is-info" onClick={this.props.onAdd}>Add value</a>}
        { this.props.arr.map((interval, index) => {
          return (
            <div className="field is-grouped" key={index}>
              <p className="control is-expanded">
                <input className="input is-small" type="number" placeholder="min" value={interval.min} onChange={(e) => this.props.onChange(e, index, "min")}/>
              </p>
              <p className="control is-expanded">
                <input className="input is-small" type="number" placeholder="max" value={interval.max} onChange={(e) => this.props.onChange(e, index, "max")}/>
              </p>
              <p className="control">
                <a className="button is-small is-danger" onClick={() => this.props.onDelete(index)}>
                  Delete this
                </a>
              </p>
              <p className="control">
                <a className="button is-small is-info" onClick={this.props.onAdd}>
                  Add one more
                </a>
              </p>
            </div>

          );
        })}
      </div>
      );
  }
}

export default Inputs
