import React, { Component } from 'react'
import emailService from '../../services/email'
import { connect } from 'react-redux'


import Message from '../shared/Message.jsx'

import Loading from '../Loading.jsx'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}


class AccessPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      memberEmail : '',
      employeeEmail: '',
      message: '',
      isError: false,
      membersEmails: [],
      employeesEmails: [],
      loading : true
    };

    this.handleMemberEmailChange = this.handleMemberEmailChange.bind(this);
    this.handleEmployeeEmailChange = this.handleEmployeeEmailChange.bind(this);
    this.handleSubmitMemberEmail = this.handleSubmitMemberEmail.bind(this);
    this.handleSubmitEmployeeEmail = this.handleSubmitEmployeeEmail.bind(this);
    this.handleOnDelete = this.handleOnDelete.bind(this);
    this.renderMails = this.renderMails.bind(this);
  }

  componentDidMount() {
    emailService.getAllEmails(this.props.user.id, (err, emails) => {
      if (err) {
        this.setState({loading: false, message: "Something goes wrong. Try a bit later.", isError: true});
        return;
      }
      if (emails) {
        this.setState({loading: false, employeesEmails: emails.employees, membersEmails: emails.members});
      }
    });
  }

  handleMemberEmailChange(e) {
    this.setState({memberEmail: e.target.value})
  }

  handleEmployeeEmailChange(e) {
    this.setState({employeeEmail: e.target.value})
  }

  handleSubmitMemberEmail() {
    this.setState({message: null, loading: true, isError: false});
      emailService.saveMember({
        headId: this.props.user.id,
        email : this.state.memberEmail
      }, (err, res) => {
        if(err || res.err){
          console.log(err, res);
          this.setState({
            loading: false, message: (err) ? err.toString() : res.err, isError: true
          });
          return;
        }
        console.log(res);
        if (res.emails) {
          this.setState({loading: false, memberEmail: '', membersEmails : res.emails, message: 'Member was successfully added.'});
        }
      })
  }


  handleSubmitEmployeeEmail() {
    this.setState({message: null, isError: false, loading: true});
    emailService.saveEmployee({
      headId: this.props.user.id,
      email : this.state.employeeEmail
    }, (err, res) => {
      if(err || res.err) {
        this.setState({
          loading: false, message: (err) ? err.toString() : res.err, isError: true
        });
        return;
      }
      console.log(res);
      if (res.emails) {
        this.setState({loading: false, employeesEmails : res.emails, employeeEmail: '', message: 'Employee was successfully added.'})
      }
    })
  }

  handleOnDelete(isMember, id) {
    if (isMember) {
        emailService.deleteMember({
          headId: this.props.user.id,
          id: id
        }, (err, res) => {
          if(err || res.err) {
            this.setState({
              loading: false, message: (err) ? err.toString() : res.err, isError: true
            });
            return;
          }
          if (res.emails) {
            this.setState({loading: false, membersEmails : res.emails, message: 'Member was deleted.'})
          }
        });
    } else {
      emailService.deleteEmployee({
        headId: this.props.user.id,
        id
      }, (err, res) => {
        if(err || res.err) {
          this.setState({
            loading: false, message: (err) ? err.toString() : res.err, isError: true
          });
          return;
        }
        if (res.emails) {
          this.setState({loading: false, employeesEmails : res.emails, message: 'Employee was deleted.'})
        }
      });
    }
  }

  renderMails(whose) {
    console.log(whose);
    if (whose === 'employees') {
      if (this.state.employeesEmails.length > 0) {
        return this.state.employeesEmails.map((employee, index) => {
          return (
            <div key={index}>
              <span className="content is-small">
                {employee.username}
                <a className="delete is-small" onClick={() => this.handleOnDelete(false, employee._id)}></a>
              </span>
            </div>
          );
        });
      } else {
        return (<div>No one has got access to the management system yet.</div>)
      }
    }
    if (whose === 'members') {
      if (this.state.membersEmails.length > 0) {
        return this.state.membersEmails.map((member, index) => {
          return (
            <div key={index}>
              <span className="content is-small">
                {member.username}
                <a className="delete is-small" onClick={() => this.handleOnDelete(true, member._id)}></a>
              </span>
            </div>
          );
        });
      } else {
        return (<div>No one has got access to this system yet.</div>)
      }
    }
  }

  render() {
    if (this.state.loading) {
      return (<Loading/>)
    }
    return (
      <section className="content-wrapper">
        { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}
        <div className="content columns is-centered">
          <div className="column is-5" style={{height: "inherit"}}>
            <div className="box">
              <h1 className="title is-5">Add new member</h1>
             <p>Enter email of the new member you want to add for medical record generation.</p>
             <div className="field  has-addons">
                <p className="control is-expanded">
                 <input className="input is-small" type="text" placeholder="Member email" value={this.state.memberEmail} onChange={this.handleMemberEmailChange}/>
                </p>
                <p className="control">
                 <a className="button is-info is-small" onClick={this.handleSubmitMemberEmail}>
                   +
                 </a>
                </p>
                </div>
            </div>
          </div>
          <div className="column is-5" style={{height: "inherit"}}>
            <div className="box">
              <h1 className="title is-5">Add new employee</h1>
              <p>Enter email of the employee who will manage patients medical records.</p>
              <div className="field has-addons">
                 <p className="control is-expanded">
                  <input className="input is-small" type="text" placeholder="Employee email" value={this.state.employeeEmail} onChange={this.handleEmployeeEmailChange}/>
                 </p>
                 <p className="control">
                  <a className="button is-info is-small" onClick={this.handleSubmitEmployeeEmail}>
                    +
                  </a>
                 </p>
                 </div>
               </div>
           </div>
        </div>
        <hr/>

        <div className="content box already-sent-emails-section">
          <div className="has-text-centered">
            <h1 className="title is-5">People already got the access to the system.</h1>
          </div>
          <div className="columns is-centered">
            <div className="column is-5 has-text-centered">
              <div className="subtitle is-6">To this system:</div>
              {this.renderMails('members')}
            </div>
            <div className="column is-5 has-text-centered">
              <div className="subtitle is-6">To management system:</div>
              {this.renderMails('employees')}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps)(AccessPage)
