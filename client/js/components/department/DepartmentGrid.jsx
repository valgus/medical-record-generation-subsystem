

import React, { Component } from 'react'


class DepartmentGrid extends Component {
  render() {
    return (
      <div className="deps-container">
        { this.props.departments.map((dep, index) => {
          console.log(dep.headId);
          console.log(this.props.user.id);
          return (
            <div className="box dep-card" key={index} onClick={() => this.props.onClick(dep._id, dep.headId)}>
              <p>{ dep.name }</p>
              {(this.props.user.id === dep.headId) ? <a className="delete is-small delete-dep" onClick={(e) => this.props.onDelete(e, dep._id)}>-</a> : ''}
              {(this.props.user.headIds.indexOf(dep.headId) >= 0) ? <span className="delete-dep fas fa-check-circle"></span> : ''}
            </div>
          );
        })}
      </div>
      );
  }
}

export default DepartmentGrid
