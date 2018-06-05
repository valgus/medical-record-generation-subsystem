

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import medrecService from '../../services/medrec.js'
import departmentService from '../../services/department.js'

import MRGrid from './MRGrid.jsx'
import Message from '../shared/Message.jsx'
import Loading from '../Loading.jsx'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}

class MRPage extends Component {

    constructor(props) {
      super(props);
      this.state = {
        message: null,
        loading: false,
        isError: false,
        newElement: '',
        type: 0,
        elements: [],
        depName: '',
        changeName: false,
        editedName: '',
        depHeadId: ''
    }

        this.handleElementChange = this.handleElementChange.bind(this);
        this.handleElementSubmit = this.handleElementSubmit.bind(this);
        this.handleElementTypeChange = this.handleElementTypeChange.bind(this);
        this.onElementClick = this.onElementClick.bind(this);
        this.onElementDelete = this.onElementDelete.bind(this);
        this.changeName = this.changeName.bind(this);
        this.setName = this.setName.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.cancelDeletion = this.cancelDeletion.bind(this);
        this.hardDelete = this.hardDelete.bind(this);
  }

  componentDidMount() {
    medrecService.getAll(this.props.params.id, (err, res) => {
      if(err || !res ||res.err){
        console.log(err, res);
        this.setState({
          loading: false, message: (err) ? err.toString() : res.err, isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, elements : res.elements, depName: res.name, depHeadId: res.headId});
    });
  }

  handleElementChange(e) {
    this.setState({newElement: e.target.value})
  }

  handleElementTypeChange(e) {
    this.setState({type: parseInt(e.target.value)})
  }

  handleElementSubmit() {
    this.setState({message: null, loading: true, isError: false});
      medrecService.save({
        name: this.state.newElement,
        type: this.state.type,
        id: this.props.params.id,
      }, (err, res) => {
        if(err || !res || res.err){
          console.log(err, res);
          this.setState({
            loading: false, message: (err) ? err.toString() : res.err, isError: true
          });
          return;
        }
        console.log(res);
        this.setState({loading: false, newElement: "", type:0, elements : res, message: 'New element was successfully added.'});
      });
  }

  onElementClick(id, type) {
        switch (type) {
          case 0: browserHistory.push(`/q/${id}`); break;
          case 1: browserHistory.push(`/t/${id}`); break;
          case 2: browserHistory.push(`/ov/${id}`); break;
          case 3: browserHistory.push(`/f/${id}`); break;
        }
  }

  onElementDelete(e, id) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({message: null, loading: true, isError: false});
    medrecService.findCreatedElement(id, (err, elementIds) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: 'Error during deletion occured.', isError: true
          });
          return;
        }
        if (elementIds.length === 0) {
          medrecService.delete({
            id, depId: this.props.params.id
          }, (err, res) => {
            if(err || !res || res.err){
              console.log(err, res);
              this.setState({
                loading: false, message: (err) ? err.toString() : res.err, isError: true
              });
              return;
            }
            console.log(res);
            this.setState({loading: false, elements : res, message: 'Element of the medical record was deleted.'});
          });
        } else {
          this.setState({loading: false, elementIds, showWarning: true, elementToDelete: id});
        }
    })
  }

  cancelDeletion() {
      this.setState({elementIds: [], showWarning: false, elementToDelete: -1});
  }

  hardDelete(isHardDelete) {
        const data = {
          id: this.state.elementToDelete,
          elements: this.state.elementIds,
          isHardDelete,
          depId: this.props.params.id
        }
       this.setState({message: null, loading: true, isError: false});
       medrecService.hardDelete(data, (err, res) => {
         if(err || !res || res.err){
           console.log(err, res);
           this.setState({
             loading: false, message: (err) ? err.toString() : res.err, isError: true
           });
           return;
         }
         console.log(res);
         this.setState({loading: false, elements : res, message: 'Element of the medical record was deleted.', showWarning: false, elementIds: [], elementToDelete: -1});
       });

  }

  handleChangeName(e) {
    this.setState({editedName: e.target.value});
  }

  changeName() {
    this.setState({changeName: true, editedName: this.state.depName});
  }

  setName() {
    this.setState({loading: true, message: '', isError: false});
    departmentService.setNewName(this.props.params.id, this.state.editedName, (err, res) => {
      if(err){
        this.setState({
          loading: false, message: "Name was not changed.", isError: true, changeName: false
        });
        return;
      }
      this.setState({loading: false, depName: this.state.editedName, changeName: false});
    });
  }

  render() {
    if (this.state.loading) {
      return (<Loading/>);
    }
    return (
      <div className="content-wrapper">
        { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}
        { (this.state.depHeadId === this.props.user.id) &&
        (<div>
          <nav className="level">
             <div className="level-left">
                 <div className="level-item">
                   <div className="field is-horizontal">
                     <div className="field-label is-small">
                       <label className="label">Add new element</label>
                     </div>
                     <div className="field-body">
                       <div className="field has-addons">
                         <div className="control has-icons-left">
                           <span className="select is-small">
                             <select value={this.state.type} onChange={this.handleElementTypeChange}>
                               <option value="0">Questionnaire</option>
                               <option value="1">Template</option>
                               <option value="2">Observed value</option>
                               <option value="3">Folder</option>
                             </select>
                           </span>
                           <div className="icon is-small is-left">
                             {this.state.type === 0 && <span className="icon is-small is-left"><i className="far fa-question-circle"></i></span>}
                             {this.state.type === 1 && <span className="icon is-small is-left"><i className="far fa-file-word"></i></span>}
                             {this.state.type === 2 && <span className="icon is-small is-left"><i className="fas fa-heartbeat"></i></span>}
                             {this.state.type === 3 && <span className="icon is-small is-left"><i className="far fa-folder-open"></i></span>}
                           </div>
                         </div>
                         <p className="control">
                           <input className="input is-small" type="text" value={this.state.newElement} placeholder="Name" onChange={this.handleElementChange}/>
                         </p>
                         <p className="control">
                           <a className="button is-info is-small" onClick={this.handleElementSubmit}>+</a>
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
             </div>
             <div className="level-right">
               <div className="level-item">
                  {!this.state.changeName &&  <a className="button is-info is-small" onClick={this.changeName}>Change name</a>}
                  {this.state.changeName &&
                    <div className="field has-addons">
                      <div className="control">
                        <input className="input is-small" type="text" defaultValue={this.state.editedName} onChange={this.handleChangeName}/>
                      </div>
                      <div className="control">
                        <a className="button is-small is-info" onClick={this.setName}>
                          Set name
                        </a>
                      </div>
                    </div>
                    }
               </div>
             </div>
           </nav>


          <hr/>
      </div>)}

      {
        this.state.showWarning &&
        <article className="message is-warning">
          <div className="message-header">
            <p>Delete element</p>
          </div>
          <div className="message-body">
            <p>This element was already created in the patients medical records in the MRMS. Choose one of the options:</p>
              <div className="buttons">
                <span className="button is-small is-primary" onClick={this.cancelDeletion}>Cancel</span>
                <span className="button is-small is-info" onClick={() => this.hardDelete(false)}>Delete element and leave its created instances</span>
                <span className="button is-small is-danger" onClick={() => this.hardDelete(true)}>Delete element and its created instances</span>
              </div>
          </div>
        </article>
      }

        <div className="has-text-centered">
          <h4 className="title is-6">This page illustrates the content of the medical record for the department <br/>{this.state.depName}:</h4>
        </div>
        <div className="">
          <MRGrid elements={this.state.elements} showDelete={this.props.user.isOwner} onClick={this.onElementClick} onDelete={this.onElementDelete}/>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(MRPage)
