import React from 'react';
import { Route, Redirect } from 'react-router'
import authService from './services/auth'
import AboutPage from './components/start/AboutPage.jsx'
import StartPage from './components/start/StartPage.jsx'
import LoginPage from './components/start/LoginPage.jsx'

import LayoutPage from './components/main/LayoutPage.jsx'

import DepartmentPage from './components/department/DepartmentPage.jsx'

import AccessPage from './components/access/AccessPage.jsx'

import NetworkPage from './components/network/NetworkPage.jsx'

import MRPage from './components/medrecord/MRPage.jsx'

import Folder from './components/medrecord/folder/Folder.jsx'
import ObValue from './components/medrecord/observedvalue/ObValue.jsx'
import Questionnaire from './components/medrecord/questionnaire/Questionnaire.jsx'
import Template from './components/medrecord/template/Template.jsx'

import NotFound from './components/NotFound.jsx'
import ServerError from './components/ServerError.jsx'

const requireAuth = (nextState, replace) => {
  if( !authService.loggedIn()) {
    console.log(`${nextState.location.pathname} requires authentication`)
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }, // #todo
    })
  }
}

const routes = (
  // <Route component={Layout}>
  //   {/*Auth*/}
  //   <Route path="/login" component={LoginPage} />
  //   <Redirect from="/" to="/diary" />
  //   <Route path="/diary" component={DiaryPage} onEnter={requireAuth}/>
  //   <Route path="/newdiary/:date" component={NewDiaryPage} onEnter={requireAuth}/>
  //
  //
  //
  //   <Route path="/whoops" component={ServerError} />
  //   <Route path="*" component={NotFound} />
  // </Route>
<Route>
  <Redirect from="/" to="/departments" />
  <Route component={StartPage}>
    <Route path="/login" component={LoginPage}/>
    <Route path="/about" component={AboutPage}/>
  </Route>
  <Route component={LayoutPage} onEnter={requireAuth}>
    <Route path="/departments" component={DepartmentPage}/>
    <Route path="/department/:id" component={MRPage}/>
    <Route path="/access" component={AccessPage}/>
    <Route path="/network" component={NetworkPage}/>
    <Route path="/f/:id" component={Folder}/>
    <Route path="/ov/:id" component={ObValue}/>
    <Route path="/q/:id" component={Questionnaire}/>
    <Route path="/t/:id" component={Template}/>
  </Route>

  <Route path="/whoops" component={ServerError} />
  <Route path="*" component={NotFound} />
</Route>


);

export default routes;
