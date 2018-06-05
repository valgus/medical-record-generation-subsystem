

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'
import Message from '../../shared/Message.jsx'
import TemplateEditor from './Editor.jsx'

import medrecService from '../../../services/medrec.js'
import departmentService from '../../../services/department.js'
import Loading from '../../Loading.jsx'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}


class Template extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message: null,
      loading: false,
      isError: false,
      name: '',
      editName: false,
      editedName: '',
      departments: [],
      depId: -1,
      parts: [],
      questionnaires: [],
      showPart: false,
      showFunctions: [],
      showInfo: [],
      updatePart: -1,
      showTemplate: false,
      currentTemplate: ''
    }
    this.editName = this.editName.bind(this);
    this.handleEditName = this.handleEditName.bind(this);
    this.setName = this.setName.bind(this);
    this.showPart = this.showPart.bind(this);
    this.saveNewPart = this.saveNewPart.bind(this);
    this.showFunctionals = this.showFunctionals.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.info = this.info.bind(this);
    this.movePart = this.movePart.bind(this);
    this.generateTemplate = this.generateTemplate.bind(this);
    this.closeTemplate = this.closeTemplate.bind(this);
    this.save = this.save.bind(this);
    this.changeDepId = this.changeDepId.bind(this);
    this.clone  = this.clone.bind(this);
  }

  componentDidMount() {
    medrecService.getTemplate(this.props.params.id, (err, res) => {
      console.log(res);
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with template extracting occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, name: res.t.name});
        if (res.t.parts) {
          const showFunctions = [];
          const showInfo = [];
          let i = 0;
          while (i < res.t.parts.length) {
            showFunctions.push(false);
            showInfo.push(false);
            i++;
          }
          this.setState({
              parts: res.t.parts,
              questionnaires: res.t.questionnaires,
              showFunctions: showFunctions,
              showInfo: showInfo
          });
        }
      });
      departmentService.getUserDeps(this.props.user.id,  this.props.user.level,  (err, departments) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with user department occured.", isError: true
          });
          return;
        }
        if (departments && departments.length > 0)
          this.setState({departments: departments, depId: departments[0]._id});
      });
  }

  save() {
    this.setState({message: null, loading: true, isError: false});
    const data = {
      _id: this.props.params.id,
      parts: this.state.parts.slice()
    };
    medrecService.saveTemplate(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with template saving occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "The template was saved.", isError: false});
      });
  }
  clone() {
    this.setState({message: null, loading: true, isError: false});
    const data = {
      _id: this.state.depId,
      name: this.state.name,
      parts: this.state.parts.slice()
    };
    medrecService.cloneTemplate(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with template cloning occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "The template was cloned. All questions linked were deleted from the template.", isError: false});
      });
  }

  showPart(show) {
    if (show && this.state.updatePart !== -1) {
      return this.setState({message:"New part of the template might be created only after update closing.", isError: false});
    }
    if (!show) {
      this.setState({updatePart: -1, showPart: false, message: null})
    } else {
      this.setState({showPart: true, message: null});
    }
  }

  saveNewPart(html, delta, linkedQuestions, notes, index) {
    const newPart = {html: '', delta: '', notes: ''};
    newPart.html = html;
    newPart.delta = delta;
    newPart.linkedQuestions = linkedQuestions;
    newPart.notes = notes;
    if (index === -1) {
      this.setState({
        parts: [...this.state.parts, newPart],
        showFunctions: [...this.state.showFunctions, false],
        showInfo: [...this.state.showInfo, false],
        showPart: false
      });
    } else {
      const parts = this.state.parts.slice();
      parts[index] = newPart;
      this.setState({
        parts,
        showPart: false,
        updatePart: -1
      });
    }
  }

  showFunctionals(i, show) {
    const showFunctions = this.state.showFunctions.slice();
    showFunctions[i] = show;
    this.setState({showFunctions});
  }

  edit(index) {
    if (this.state.showPart) {
      return this.setState({message:"Template might be update only after new part of the template closing.", isError: false});
    }
    this.setState({updatePart:index, message: null});
  }

  delete(index) {
      const parts = this.state.parts.slice();
      parts.splice(index, 1);
      this.setState({parts});
  }

  info(i, show) {
    const showInfo = this.state.showInfo.slice();
    showInfo[i] = show;
    this.setState({showInfo});
  }

  movePart(i, isUp) {
    let parts = this.state.parts.slice();
    const removedElement = parts.splice(i, 1)[0];
    console.log(removedElement);
    if (isUp) {
      parts.splice(--i, 0, removedElement);
    } else {
      parts.splice(++i, 0, removedElement);
    }
    this.setState({parts});
  }


    changeDepId(e) {
      this.setState({depId: e.target.value});
    }

  generateTemplate() {
    let str = '';
    for (const part of this.state.parts) {
      str += part.html;
    }
    console.log(str);
    this.setState({currentTemplate: str, showTemplate: true});
  }

  closeTemplate() {
    this.setState({currentTemplate: '', showTemplate: false});
  }



    editName() {
        this.setState({editName: true, editedName: this.state.name});
    }

    handleEditName(e) {
        this.setState({editedName: e.target.value});
    }

    setName() {
      this.setState({loading: true, message: '', isError: false});
      medrecService.setNewName(this.props.params.id, this.state.props.level, this.state.editedName, (err, res) => {
        if(err){
          this.setState({
            loading: false, message: "Name was not changed.", isError: true, editName: false
          });
          return;
        }
        this.setState({loading: false, name: this.state.editedName, editName: false});
      });
    }

  render() {
    if (this.state.loading) {
      return (<Loading/>);
    }
    return(
    <div className="content-wrapper">
      { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}
      <nav className="level">
        <div className="level-left">
          {!this.state.editName &&
            <div className="level-item">
              <h5 className="title is-5 mr-10">Template: {this.state.name}.</h5>
                <span className="icon has-text-info" onClick={this.editName}>
                  <i className="fas fa-edit"></i>
                </span>
            </div>}
          {this.state.editName &&
            <div className="level-item">
            <div className="field has-addons">
              <div className="control">
                <input className="input is-small" type="text" defaultValue={this.state.editedName} onChange={this.handleEditName}/>
              </div>
              <div className="control">
                <a className="button is-small is-info" onClick={this.setName}>
                  Set name
                </a>
              </div>
            </div>
          </div>
          }
        </div>
        <div className="level-right">
          <a className="button level-item is-small is-primary" onClick={browserHistory.goBack}>Return</a>
            { this.props.user.isOwner && <a className="button level-item is-small is-info" onClick={this.save}>Save</a>}
            { this.state.departments.length > 0 &&
              <div className="select is-small">
                <select value={this.state.depId}  onChange={this.changeDepId}>
                  {
                    this.state.departments.map((dep, index) => {
                      return (
                            <option value={dep._id} key={index}>{dep.name}</option>
                      );
                    })
                  }
                </select>
              </div>}
                { this.state.departments.length > 0 && <a className="button level-item is-small is-info" onClick={this.clone}>Clone</a>}
        </div>
      </nav>
      <hr/>
        {this.state.parts.length > 0 && <nav className="level">
        <div className="level-left">
          <div className="level-item">
          <div className="title is-6">Template content:</div>
          </div>
        </div>
        <div className="level-right">
          <a className="button level-item is-small is-info" onClick={this.generateTemplate}>Show current template</a>
        </div>
      </nav>}

        {this.state.parts.map((part, index) => {
          if (this.state.updatePart !== index) {
            return (
            <div key={index} className="box part-container" onMouseOver={()=>this.showFunctionals(index, true)} onMouseOut={()=>this.showFunctionals(index, false)}>
              <nav className="level">
                 <div className="level-left"></div>
                 <div className="level-right">
                   <div className="level-item">
                     <a onClick={() => this.edit(index)}><span className={(!this.state.showFunctions[index])? "icon hidden" : "icon"}><i className="fas fa-edit"></i></span></a>
                     <a onClick={() => this.delete(index)}><span className={(!this.state.showFunctions[index])? "icon hidden" : "icon"}><i className="fas fa-times-circle"></i></span></a>
                     <a onClick={() => this.info(index, true)}><span className={(!this.state.showFunctions[index])? "icon hidden" : "icon"}><i className="fas fa-question-circle"></i></span></a>
                   </div>
                   <div className="level-item">
                     <a onClick={()=> this.movePart(index, true)}><span className={(!this.state.showFunctions[index])? "icon hidden" : "icon arrows"}><i className="fas fa-arrow-alt-circle-up"></i></span></a>
                     <a onClick={()=> this.movePart(index, false)}><span className={(!this.state.showFunctions[index])? "icon hidden" : "icon arrows"}><i className="fas fa-arrow-alt-circle-down"></i></span></a>
                   </div>
                 </div>
               </nav>
              <div className="part-content-center" dangerouslySetInnerHTML={{ __html: part.html }}/>
                {this.state.showInfo[index] && <article className="message  is-small is-link part-notes">
                  <div className="message-header">
                    <p>Notes</p>
                    <button className="delete is-small" aria-label="delete" onClick={() => this.info(index, false)}></button>
                  </div>
                  <div className="message-body">
                      {part.notes}
                  </div>
                </article>}
            </div>
          );
        } else {
          return (<TemplateEditor key={index} index={index} existingPart={part} questionnaires={this.state.questionnaires} cancel={() => this.showPart(false)}  save={this.saveNewPart}/>);
        }
        })}
        {this.state.parts.length > 0 && <hr/>}
        {!this.state.showPart && <a className="button is-small is-info mt-20" onClick={() => this.showPart(true)}>Create template block</a>}
        {this.state.showPart && <TemplateEditor index ={-1} questionnaires={this.state.questionnaires} cancel={() => this.showPart(false)}  save={this.saveNewPart}/>}

        {this.state.showTemplate && <div className="modal is-active">
          <div className="modal-background"></div>
            <div className="modal-card" style={{width: "100%"}}>
              <section className="modal-card-body template-view">
                <div dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }}/>
              </section>
            </div>
          <button className="modal-close is-large" aria-label="close" onClick={this.closeTemplate}></button>
        </div> }

    </div>
  );
  }
}

export default connect(mapStateToProps)(Template)
