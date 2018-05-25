
import React, { Component } from 'react'


class DepartmentGrid extends Component {
  render() {
    return (
      <div className="medrec-container">
        { this.props.elements.map((el, index) => {
          return (
            <div className="box med-card has-text-centered" key={index} onClick={() => this.props.onClick(el._id, el.type)}>
              {this.props.showDelete && <a className="delete is-small delete-med" onClick={(e) => this.props.onDelete(e, el._id)}>-</a>}
              {parseInt(el.type) === 0 && <span className="icon is-small med-icon"><i className="far fa-question-circle"></i></span>}
              {parseInt(el.type) === 1 && <span className="icon is-small med-icon"><i className="far fa-file-word"></i></span>}
              {parseInt(el.type) === 2 && <span className="icon is-small med-icon"><i className="fas fa-heartbeat"></i></span>}
              {parseInt(el.type) === 3 && <span className="icon is-small med-icon"><i className="far fa-folder-open"></i></span>}
              <p className="med-text">{ el.name }</p>
            </div>
          );
        })}
      </div>
      );
  }
}

export default DepartmentGrid
