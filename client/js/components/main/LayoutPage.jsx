

import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import * as authActions from '../../store/actions/auth'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'



function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch),
  }
}

function mapStateToProps (state) {
  return {
    user: state.user
  }
}

class LayoutPage extends Component {

  constructor(props) {
    super(props);
    let activeTab = 0;
    switch(this.props.location.pathname) {
      case '/departments' : activeTab = 0; break;
      case '/access' : activeTab = 1; break;
      case '/network' : activeTab = 2; break;
    }
    this.state = {
      activeTab,
      message: null,
      isError: false
    };

    this.handleSidebarClick = this.handleSidebarClick.bind(this);
  }

  handleSidebarClick(e) {
    if (e.target.innerHTML === 'Departments') {
      this.setState({activeTab: 0});
      browserHistory.push("/departments");
    } else if (e.target.innerHTML === 'Access') {
      this.setState({activeTab: 1});
      browserHistory.push("/access");
    }  else if (e.target.innerHTML === 'Network'){
      this.setState({activeTab: 2});
      browserHistory.push("/network");
    } else if (e.target.innerHTML === 'Log out') {
      this.props.actions.logout();
    }
  }
  render() {
    return (
      <div className="layout">
        <section className="is-fullheight">
          <aside className="menu">
            <p className="menu-label has-text-centered">
              Navigation
            </p>
            <ul className="menu-list">
              <li><a className={(this.state.activeTab === 0) ? "is-active": ""} onClick={this.handleSidebarClick}>Departments</a></li>
              {this.props.user.level === 0 && <li><a className={(this.state.activeTab === 1) ? "is-active": ""} onClick={this.handleSidebarClick}>Access</a></li>}
              <li><a className={(this.state.activeTab === 2) ? "is-active": ""} onClick={this.handleSidebarClick}>Network</a></li>
              <li><a onClick={this.handleSidebarClick}>Log out</a></li>
            </ul>
          </aside>
       <div className="content main-content">
         {this.props.children}
        </div>
        <div className="column"></div>
      </section>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutPage)
