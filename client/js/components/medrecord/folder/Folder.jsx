

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'


import Inputs from '../Inputs.jsx'
import Message from '../../shared/Message.jsx'

import medrecService from '../../../services/medrec.js'
import departmentService from '../../../services/department.js'
import Loading from '../../Loading.jsx'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}


class Folder extends Component {


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
        allFiles: false,
        images: false,
        videos: false,
        text: false,
        audios: false,
        firstchecked: false,
        secondchecked: false,
        substrings: ['']
    }
    this.editName = this.editName.bind(this);
    this.handleEditName = this.handleEditName.bind(this);
    this.setName = this.setName.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.deleteSubstring = this.deleteSubstring.bind(this);
    this.addNewSubstring = this.addNewSubstring.bind(this);
    this.changeSubstring = this.changeSubstring.bind(this);
    this.toggleTypeCheck = this.toggleTypeCheck.bind(this);
    this.toggleStringCheck = this.toggleStringCheck.bind(this);
    this.save = this.save.bind(this);
    this.changeDepId = this.changeDepId.bind(this);
    this.clone  = this.clone.bind(this);
  }

  componentDidMount() {
  this.setState({message: null, loading: true, isError: false});
    medrecService.getFolder( this.props.params.id, (err, res) => {
      if(err){
        console.log(err);
        this.setState({
          loading: false, message: "The problem with folder information occured.", isError: true
        });
        return;
      }
      this.setState({loading: false, name: res.folder.name});
      if (res.folder.substrings) {      //if the folder was previously created
        this.setState({substrings: res.folder.substrings,
          images: res.folder.saveImages, videos: res.folder.saveVideos,
           text: res.folder.saveText, audios: res.folder.saveAudios,
         allFiles: res.folder.saveImages && res.folder.saveVideos && res.folder.saveAudios && res.folder.saveText});
         if (res.folder.saveImages || res.folder.saveVideos || res.folder.saveAudios || res.folder.saveText) {
           this.setState({firstchecked: true});
         }
         if (res.folder.substrings[0]!== '') {
            this.setState({secondchecked: true});
         }
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

  toggleTypeCheck() {
      this.setState({firstchecked: !this.state.firstchecked});
  }
  toggleStringCheck() {
    this.setState({secondchecked: !this.state.secondchecked});
  }

  onTypeChange(i) {
    switch(i) {
      case 0: this.setState({allFiles: !this.state.allFiles, images: !this.state.allFiles, videos: !this.state.allFiles, text: !this.state.allFiles, audios: !this.state.allFiles}); break;
      case 1: this.setState({allFiles: (!this.state.images && this.state.videos && this.state.text && this.state.audios), images: !this.state.images});break;

      case 2: this.setState({allFiles: (this.state.images && !this.state.videos && this.state.text && this.state.audios),videos: !this.state.videos});break;
      case 3: this.setState({allFiles: (this.state.images && this.state.videos && this.state.text && !this.state.audios), audios: !this.state.audios});break;
      case 4: this.setState({allFiles: (this.state.images && this.state.videos && !this.state.text && this.state.audios), text: !this.state.text});break;
    }
  }

  deleteSubstring(i) {
    const substrings = this.state.substrings;
    substrings.splice(i, 1);
    this.setState({ substrings: substrings });
  }

  addNewSubstring() {
    this.setState({substrings: [...this.state.substrings, ""] });
  }

  changeSubstring(e, i) {
    const substrings = this.state.substrings;
    substrings[i] = e.target.value;
    this.setState({ substrings: substrings });
    console.log(this.state.substrings);
  }

  changeDepId(e) {
    this.setState({depId: e.target.value});
  }

  save() {
  this.setState({message: null, loading: true, isError: false});
    const data = {
      _id: this.props.params.id,
      saveImages: this.state.images,
      saveVideos: this.state.videos,
      saveText: this.state.text,
      saveAudios: this.state.audios,
      substrings: this.state.substrings
    };
    if (!this.state.firstchecked) {
      data.saveImages = false;
      data.saveVideos = false;
      data.saveText = false;
      data.saveAudios = false;
    }
    if (!this.state.secondchecked) {
      data.substrings = [""];
    }
      medrecService.saveFolder( data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: (err) ? err.toString() : res.err, isError: true
          });
          return;
        }
        console.log(res);
        this.setState({loading: false, isError: false, message: 'Folder settings were saved.'});
      });
  }

  clone() {
    this.setState({message: null, loading: true, isError: false});
      const data = {
        _id: this.state.depId,
        name: this.state.name,
        saveImages: this.state.images,
        saveVideos: this.state.videos,
        saveText: this.state.text,
        saveAudios: this.state.audios,
        substrings: this.state.substrings
      };
      if (!this.state.firstchecked) {
        data.saveImages = false;
        data.saveVideos = false;
        data.saveText = false;
        data.saveAudios = false;
      }
      if (!this.state.secondchecked) {
        data.substrings = [""];
      }
        medrecService.cloneFolder( data, (err, res) => {
          if(err){
            console.log(err);
            this.setState({
              loading: false, message: (err) ? err.toString() : res.err, isError: true
            });
            return;
          }
          console.log(res);
          this.setState({loading: false, isError: false, message: 'Folder settings were cloned to the department.'});
        });
  }


    editName() {
        this.setState({editName: true, editedName: this.state.name});
    }

    handleEditName(e) {
        this.setState({editedName: e.target.value});
    }

    setName() {
      this.setState({loading: true, message: '', isError: false});
      medrecService.setNewName(this.props.params.id, this.state.editedName, (err, res) => {
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
    return (
      <div className="content-wrapper">
            { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}

            <nav className="level">
              <div className="level-left">
                {!this.state.editName &&
                  <div className="level-item">
                    <h5 className="title is-5 mr-10">Folder: {this.state.name}.</h5>
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
          <p>Set which files are saved in this folder.</p>

            <article className="media">
              <div className="media-content">
                <div className="content">
                  <label className="checkbox">
                    <input type="checkbox" checked={this.state.firstchecked} onChange={this.toggleTypeCheck} />
                    Save files of these types:
                  </label>
                </div>
                <article className="media">
                  <div className="media-left"></div>
                  <div className="media-content">
                    <div className="content">
                      <label className="checkbox">
                        <input type="checkbox" checked={this.state.allFiles} disabled={!this.state.firstchecked} onChange={() => this.onTypeChange(0)}/>
                        All files
                      </label>
                    </div>
                  </div>
                </article>
                  <article className="media">
                    <div className="media-left"></div>
                    <div className="media-content">
                      <div className="content">
                        <label className="checkbox">
                          <input type="checkbox" checked={this.state.images} disabled={!this.state.firstchecked}  onChange={() => this.onTypeChange(1)} />
                          Images
                        </label>
                      </div>
                    </div>
                  </article>
                  <article className="media">
                    <div className="media-left"></div>
                    <div className="media-content">
                      <div className="content">
                        <label className="checkbox">
                          <input type="checkbox" checked={this.state.videos} disabled={!this.state.firstchecked}  onChange={() => this.onTypeChange(2)} />
                          Video files
                        </label>
                      </div>
                    </div>
                  </article>
                    <article className="media">
                      <div className="media-left"></div>
                      <div className="media-content">
                        <div className="content">
                          <label className="checkbox">
                            <input type="checkbox" checked={this.state.audios} disabled={!this.state.firstchecked}  onChange={() => this.onTypeChange(3)} />
                            Audio files
                          </label>
                        </div>
                      </div>
                    </article>
                      <article className="media">
                        <div className="media-left"></div>
                        <div className="media-content">
                          <div className="content">
                            <label className="checkbox">
                              <input type="checkbox" checked={this.state.text} disabled={!this.state.firstchecked}  onChange={() => this.onTypeChange(4)} />
                              Text files
                            </label>
                          </div>
                        </div>
                      </article>
                      </div>
                    </article>
                    {/*now the next checkbos with state.substrings*/}
                    <article className="media">
                      <div className="media-content">
                        <div className="content">
                          <label className="checkbox">
                            <input type="checkbox" checked={this.state.secondchecked} onChange={this.toggleStringCheck} />
                            Save files which have in their name the following text:
                          </label>
                        </div>
                        <article className="media">
                          <div className="media-left"></div>
                            <div className="media-content">
                                <Inputs arr={this.state.substrings} enabled={this.state.secondchecked} onDelete={this.deleteSubstring} onAdd={this.addNewSubstring} onChange={this.changeSubstring}/>
                            </div>
                        </article>
                      </div>
                    </article>
                  </div>
    );
  }
}

export default connect(mapStateToProps)(Folder)
