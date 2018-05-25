

import React, { Component } from 'react'

import { connect } from 'react-redux'
import Loading from '../Loading.jsx'
import Message from '../shared/Message.jsx'

import medrecService from '../../services/medrec.js'
import departmentService from '../../services/department.js'
import networkService from '../../services/network.js'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}

class NetworkPage extends Component {
  constructor (props) {
    super(props);
    this.state = {
      message: null,
      loading: true,
      isError: false,
      departments: null,
      networkInfo: null,
      depId: null
    }

    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
    this.getDepartmentNetwork = this.getDepartmentNetwork.bind(this);
    this.addDepartment = this.addDepartment.bind(this);
    this.sendConfirmation = this.sendConfirmation.bind(this);
    this.chooseElements = this.chooseElements.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.changeElement = this.changeElement.bind(this);
  }

  componentDidMount () {
    departmentService.getUserDeps(this.props.user.id,  this.props.user.level, (err, res) => {
      if (err || !res ||res.err) {
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

  handleDepartmentChange(e) {
    this.setState({departmentId: e.target.value});
    if (e.target.value !== "0") {
      this.getDepartmentNetwork(e.target.value);
    }
  }

  addDepartment() {
    const departmentName = this.state.departments.find((dep) => dep._id === this.state.departmentId).name;
    this.setState({loading: true, message: null, isError: false})
    networkService.addDepartment(this.state.departmentId, departmentName, (err, res) => {
      if (err || !res ||res.err) {
        console.log(err, res);
        this.setState({
          loading: false, message: 'Department cannot be added now.', isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, networkInfo: JSON.parse(res)});
    });
  }

  getDepartmentNetwork(id) {
    console.log('Get department network for', id);
    this.setState({loading: true, message: null, isError: false})
    networkService.getInfo(id, (err, res) => {
      if (err || (res && res.err)) {
        console.log(err, res);
        this.setState({
          loading: false, message: 'Network infromation for the department cannot be obtained now.', isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, networkInfo: JSON.parse(res)});
    });
  }

  sendConfirmation(id, accept) {
    this.setState({loading: true, message: null, isError: false});
    const options = {
      toId: id,
      depId: this.state.departmentId,
      accept
    }
    if (accept) {
      options.elements = this.state.elements;
    }
    networkService.confirmRequest(options, (err, res) => {
      if (err || (res && res.err)) {
        console.log(err, res);
        this.setState({
          loading: false, message: 'Request cannot be saved now.', isError: true
        });
        return;
      }
      if (!res) {
        this.setState({
          loading: false, message: 'Department is not linked to the network.', isError: true
        });
      }
      console.log(res);
      this.setState({loading: false, networkInfo: JSON.parse(res), message: "Request was sent to the department.", elements: null, confirmForId: null, showModal: false});
    });
  }


  sendRequest(id) {
    this.setState({loading: true, message: null, isError: false})
    networkService.sendRequest(id, this.state.departmentId, (err, res) => {
      if (err || (res && res.err)) {
        console.log(err, res);
        this.setState({
          loading: false, message: 'Request cannot be saved now.', isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, networkInfo: JSON.parse(res), message: "Request was sent to the department."});
    });
  }

  chooseElements(forId) {
    medrecService.getInfoElements(this.state.departmentId, (err, res) => {
      if (err || (res && res.err)) {
        console.log(err, res);
        this.setState({
          loading: false, message: 'Confirmation cannot be mage now.', isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, showModal: true, elements: res, confirmForId: forId});
    });
  }

  changeElement(index) {
    const elements = this.state.elements.slice();
    elements[index].isChecked = !elements[index].isChecked;
    this.setState({elements});
  }

  render() {
    if (this.state.loading && !this.state.departments) {
      return (<Loading/>);
    }
    return (
        <div className="content-wrapper">
          { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}
          <div className="department-container">
            <p>Choose one of the departments to see its network.</p>
            <div className="select is-small">
              <select value={this.state.departmentId} onChange={this.handleDepartmentChange}>
                <option value="0" key="0">---</option>
                {
                  this.state.departments.map((dep, index) => {
                    return(
                      <option value={dep._id} key={index+1}>{dep.name}</option>
                    )
                  })
                }
              </select>
            </div>
          </div>
          <div className="networkInfo-container">
            <p className="has-text-centered title is-5">Network information</p>
            {
              !this.state.networkInfo && this.state.departmentId && this.state.departmentId !== "0" &&
              <div className="lack-of-networkInfo-container">
                <p><em>This department is not registered in the network</em></p>
                <a className="button is-info is-small" onClick={this.addDepartment}>Add department in the network</a>
              </div>
            }
            {
              this.state.networkInfo &&
              <div className="network-details-container">
                  <div className="columns is-centered">
                    <div className="column is-5 dep-requests">
                      <p className="blockchain-info-title"><b>Department requests</b></p>
                      {this.state.networkInfo.depRequests && this.state.networkInfo.depRequests.length > 0 &&
                      <table className="table">
                        <thead>
                         <tr>
                           <th></th>
                           <th></th>
                           <th></th>
                         </tr>
                       </thead>
                       <tbody>
                        {this.state.networkInfo.depRequests.map((req, index)=> {
                          return (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{req.name}</td>
                              <td>{req.date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>}
                    {(!this.state.networkInfo.depRequests ||
                    (this.state.networkInfo.depRequests && this.state.networkInfo.depRequests.length === 0)) &&
                    <p className="blockchain-no-info"><em>No requests sent by the department</em></p>
                    }
                    </div>
                    <div className="column is-5 dep-confirmations">
                      <p className="blockchain-info-title"><b>Confirmations to the department</b></p>
                        {this.state.networkInfo.confirmations && this.state.networkInfo.confirmations.length > 0 &&
                           <table className="table">
                          <thead>
                           <tr>
                             <th></th>
                             <th></th>
                           </tr>
                         </thead>
                         <tbody>
                          {this.state.networkInfo.confirmations.map((conf, index)=> {
                            return (
                              <tr key={index}>
                                <td>{index+1}</td>
                                <td>{conf.name}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        </table>}
                        {(!this.state.networkInfo.confirmations ||
                        (this.state.networkInfo.confirmations && this.state.networkInfo.confirmations.length === 0)) &&
                        <p className="blockchain-no-info"><em>No confirmations for the department</em></p>
                        }
                    </div>
                  </div>
                  <div className="columns is-centered">
                    <div className="column is-5 requests-to-dep">
                      <p className="blockchain-info-title"><b>Requests sent to the department</b></p>
                        {this.state.networkInfo.toDepRequests && this.state.networkInfo.toDepRequests.length > 0 &&
                          <table className="table">
                        <thead>
                         <tr>
                           <th></th>
                           <th></th>
                           <th></th>
                           <th></th>
                         </tr>
                       </thead>
                       <tbody>
                        {this.state.networkInfo.toDepRequests.map((req, index)=> {
                          return (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{req.name}</td>
                              <td><a className="button is-info is-small" onClick={() => this.chooseElements(req.id)}>Accept</a></td>
                              <td><a className="button is-danger is-small" onClick={() => this.sendConfirmation(req.id, false)}>Decline</a></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>}
                      {(!this.state.networkInfo.depRequests ||
                      (this.state.networkInfo.depRequests && this.state.networkInfo.depRequests.length === 0)) &&
                      <p className="blockchain-no-info"><em>No requests waiting for the department approving.</em></p>
                      }
                    </div>
                    <div className="column is-5 dep-confirmations">
                      <p className="blockchain-info-title"><b>Confirmations made by department</b></p>
                        {this.state.networkInfo.depConfirmations && this.state.networkInfo.depConfirmations.length > 0 &&
                          <table className="table">
                          <thead>
                           <tr>
                             <th></th>
                             <th></th>
                             <th></th>
                           </tr>
                         </thead>
                         <tbody>
                          {this.state.networkInfo.depConfirmations.map((conf, index)=> {
                            return (
                              <tr key={index}>
                                <td>{index+1}</td>
                                <td>{conf.name}</td>
                                <td><a className="button is-info is-small" onClick={() => this.sendConfirmation(conf.id, false)}>Cancel</a></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>}
                        {(!this.state.networkInfo.depConfirmations ||
                        (this.state.networkInfo.depConfirmations && this.state.networkInfo.depConfirmations.length === 0)) &&
                        <p className="blockchain-no-info"><em>No confirmations made by the department.</em></p>
                        }
                    </div>
                  </div>
                  <div className="departments-container has-text-centered">
                    <p className="title is-6">List of the departments</p>
                      <table className="table">
                        <thead>
                         <tr>
                           <th></th>
                           <th></th>
                           <th></th>
                         </tr>
                       </thead>
                       <tbody>
                        {this.state.networkInfo.deps &&
                        this.state.networkInfo.deps.map((dep, index)=> {
                          return (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{dep.name}</td>
                              <td><a className="button is-info is-small" onClick={() => this.sendRequest(dep.id)}>Send request</a></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                  </div>
              </div>
            }
          </div>
          {this.state.showModal && <div className="modal is-active">
            <div className="modal-background"></div>
              <div className="modal-card" style={{width: "100%"}}>
                <section className="modal-card-body">
                  {
                    this.state.elements && this.state.elements.length > 0 &&
                    <div>
                      <p>Choose elements that will be available for the department. </p>
                  {    this.state.elements.map((el, index) => {
                        return(
                          <label className="checkbox is-small" key={index}>
                            <input type="checkbox" className="is-small"  defaultChecked={el.isChecked} onChange={() => this.changeElement(index)}/>
                            {defineType(el.type)} : {el.name}
                          </label>
                        )
                      })}
                      <button className="button is-info is-small" onClick={() => this.sendConfirmation(this.state.confirmForId, true)}>Accept request</button>
                    </div>
                  }
                  {!this.state.elements || this.state.elements.length === 0 && <p><em>No elements in the medical record of this department.</em></p>}
                </section>
              </div>
              <button className="modal-close is-large" aria-label="close" onClick={() => this.setState({elements: null, showModal: false, confirmForId: null})}></button>
          </div>
          }
        </div>
    )
  }
}

function defineType(type) {
  switch(type)  {
    case 0: return "Questionnaire";
    case 2: return "Observed value"
  }
}

export default connect(mapStateToProps)(NetworkPage)
