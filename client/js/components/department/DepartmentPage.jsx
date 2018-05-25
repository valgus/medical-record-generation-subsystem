

import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import DepartmentGrid from './DepartmentGrid.jsx'
import Message from '../shared/Message.jsx'

import departmentService from '../../services/department.js'

import * as generalActiosn from '../../store/actions/general'


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(generalActiosn, dispatch),
  }
}

function mapStateToProps (state) {
  return {
    user: state.user
  }
}

class DepartmentPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message: null,
      loading: false,
      isError: false,
      newDep: "",
      departments: []
    };

    this.handleDepChange = this.handleDepChange.bind(this);
    this.handleDepSubmit = this.handleDepSubmit.bind(this);
    this.handleDepDelete = this.handleDepDelete.bind(this);
    this.cancelDeletion = this.cancelDeletion.bind(this);
    this.hardDelete = this.hardDelete.bind(this);
    this.handleDepClick = this.handleDepClick.bind(this);
  }

  componentDidMount() {
    departmentService.getAll((err, res) => {
      if(err || !res ||res.err){
        console.log(err, res);
        this.setState({
          loading: false, message: (err) ? err.toString() : res.err, isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, departments : res});
    });
  }

  handleDepChange(e) {
    this.setState({newDep: e.target.value})
  }

  handleDepSubmit() {
    this.setState({message: null, loading: true, isError: false});
      departmentService.save({
        name: this.state.newDep,
        id: this.props.user.id
      }, (err, res) => {
        if(err || !res || res.err){
          console.log(err, res);
          this.setState({
            loading: false, message: (err) ? err.toString() : res.err, isError: true
          });
          return;
        }
        console.log(res);
        this.setState({loading: false, newDep: "", departments : res, message: 'Department was successfully added.'});
      });
  }

  handleDepDelete(e, id) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({message: null, loading: true, isError: false});
      departmentService.findMedrecs(id, (err, medRecIds) => {
          if(err){
            console.log(err);
            this.setState({
              loading: false, message: 'Error during deletion occured.', isError: true
            });
            return;
          }
          if (medRecIds.length === 0) {
             departmentService.delete({id}, (err, res) => {
              if(err || !res || res.err){
                console.log(err, res);
                this.setState({
                  loading: false, message: (err) ? err.toString() : res.err, isError: true
                });
                return;
              }
              console.log(res);
              this.setState({loading: false, departments : res, message: 'Department was deleted.'});
            });
          } else {
            this.setState({loading: false, medRecIds, showWarning: true, depToDelete: id});
          }
      })
  }

  cancelDeletion() {
      this.setState({medRecIds: [], showWarning: false, depToDelete: -1});
  }

  hardDelete() {
        const data = {
          id: this.state.depToDelete,
          medRecIds: this.state.medRecIds
        }
        this.setState({message: null, loading: true, isError: false});
       departmentService.hardDelete(data, (err, res) => {
         if(err || !res || res.err){
           console.log(err, res);
           this.setState({
             loading: false, message: (err) ? err.toString() : res.err, isError: true
           });
           return;
         }
         console.log(res);
         this.setState({loading: false, departments : res, message: 'Department was deleted.', showWarning: false, medRecIds: [], depToDelete: -1});
       });

  }

  handleDepClick(id, depHeadId) {
    let isOwner = (depHeadId === this.props.user.id) ? true : false;
    if (!isOwner) {
      if (this.props.user.headIds.indexOf(depHeadId) >=0) {
        isOwner = true;
      }
    }
    this.props.actions.setHasAvaiability(isOwner);
    browserHistory.push(`/department/${id}`);
  }

  render() {
    return (
        <section className="content-wrapper">
            { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}
            {this.props.user.level === 0 && <div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">Add new department</label>
                </div>
                <div className="field-body">
                   <div className="field  has-addons">
                      <p className="control is-expanded">
                       <input className="input is-small" type="text" value={this.state.newDep} placeholder="Department name" onChange={this.handleDepChange}/>
                      </p>
                      <p className="control">
                       <a className="button is-info is-small" onClick={this.handleDepSubmit}>
                         +
                       </a>
                      </p>
                    </div>
                  </div>
                </div>
                <hr />

              </div>}
              {
                this.state.showWarning &&
                <article className="message is-warning">
                  <div className="message-header">
                    <p>Delete department</p>
                  </div>
                  <div className="message-body">
                    <p>Department has already created medical records in the MRMS. If you delete the department, <strong>all medical records that belong to this department will be also deleted</strong>. Delete the department?</p>
                      <div className="buttons">
                        <span className="button is-primary" onClick={this.cancelDeletion}>No</span>
                        <span className="button is-info" onClick={this.hardDelete}>Yes</span>
                      </div>
                  </div>
                </article>


              }
              {this.state.departments &&
                <DepartmentGrid
                  departments={this.state.departments}
                  user={this.props.user}
                  onDelete={this.handleDepDelete}
                  onClick={this.handleDepClick} />
              }
        </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentPage)
