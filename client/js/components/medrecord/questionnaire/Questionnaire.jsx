

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'
import Message from '../../shared/Message.jsx'
import Question from './Question.jsx'
import UpdateQuestion from './UpdateQuestion.jsx'

import medrecService from '../../../services/medrec.js'
import departmentService from '../../../services/department.js'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}


class Questionnaire extends Component {


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
        showQuestion: false,
        newQuestion: {
          id: 0,
          name: '',
          type: 0,
          options: [],
          hidden: false,
          linkIndex: -1
        },
        questions: [],
        showFunctions:[],
        updateQuestion: -1
      }
      this.editName = this.editName.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.setName = this.setName.bind(this);
      this.showQuestion = this.showQuestion.bind(this);
      this.changeNewQuestionName = this.changeNewQuestionName.bind(this);
      this.changeNewQuestionType = this.changeNewQuestionType.bind(this);
      this.renderLink = this.renderLink.bind(this);
      this.deleteOption = this.deleteOption.bind(this);
      this.addNewOption = this.addNewOption.bind(this);
      this.changeOption = this.changeOption.bind(this);
      this.saveQuestion = this.saveQuestion.bind(this);
      this.handleQuestionIsHidden = this.handleQuestionIsHidden.bind(this);
      this.changeNewQuestionLinkIndex = this.changeNewQuestionLinkIndex.bind(this);
      this.setAnswerFoNewQuestion = this.setAnswerFoNewQuestion.bind(this);
      this.showFunctionals = this.showFunctionals.bind(this);
      this.deleteQuestion = this.deleteQuestion.bind(this);
      this.editQuestion = this.editQuestion.bind(this);
      this.moveQuestion = this.moveQuestion.bind(this);
      this.save = this.save.bind(this);
      this.changeDepId = this.changeDepId.bind(this);
      this.clone  = this.clone.bind(this);
  }

  componentDidMount() {
    medrecService.getQuestionnaire(this.props.params.id, (err, res) => {
      console.log(res);
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with questionnaire extracting occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, name: res.q.name});
        if (res.q.questions) {
          const showFunctions = [];
          let i = 0;
          while (i < res.q.questions.length) {
            showFunctions.push(false);
            i++;
          }
          this.setState({
              questions: res.q.questions,
              showFunctions: showFunctions
          });
        }
      });
  //    if (!this.props.user.isOwner) {
        departmentService.getUserDeps(this.props.user.id,  this.state.props.user.level, (err, res) => {
          if(err){
            console.log(err);
            this.setState({
              loading: false, message: "The problem with user department occured.", isError: true
            });
            return;
          }
          if (res.departments && res.departments.length > 0)
            this.setState({departments: res.departments, depId: res.departments[0]._id});
        });
  //    }
  }

  save() {

    this.setState({message: null, loading: true, isError: false});
    const data = {
      _id: this.props.params.id,
      questions: this.state.questions.slice()
    };
    medrecService.saveQuestionnaire(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with questionnaire saving occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "The questionnaire was saved.", isError: false});
      });
  }

  clone() {

    this.setState({message: null, loading: true, isError: false});
    const data = {
      _id: this.state.depId,
      name: this.state.name,
      questions: this.state.questions.slice()
    };
    medrecService.cloneQuestionnaire(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with questionnaire cloning occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "The questionnaire was cloned.", isError: false});
      });
  }

  showQuestion(show) {
    if (show && this.state.updateQuestion !== -1) {
      return this.setState({message:"New question might be created only after update closing.", isError: false});
    }
    this.setState({showQuestion: show});
    if (!show) {
      this.setState({newQuestion: {
        name: '',
        type: 0,
        options: [],
        hidden: false,
        linkIndex: 0
      },
    updateQuestion: -1});
    }
  }

  changeNewQuestionName(e) {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.name = e.target.value;
    this.setState({newQuestion});
  }
  changeNewQuestionType(e) {
    const newQuestion = {...this.state.newQuestion};
    const previousType = newQuestion.type;
    newQuestion.type = parseInt(e.target.value);
    if ((newQuestion.type === 0 || newQuestion.type === 1) &&
        (previousType === 2 || previousType === 3)) {
          newQuestion.options = [];
        }
    this.setState({newQuestion});
  }

  deleteOption(i) {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.options.splice(i, 1);
    this.setState({ newQuestion });
  }

  addNewOption() {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.options.push("")
    this.setState({newQuestion});
  }

  changeOption(e, i) {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.options[i] = e.target.value;
    this.setState({ newQuestion });
  }

  saveQuestion(isNew, i) {
    if (isNew) {
      const newQuestion = {...this.state.newQuestion};
      newQuestion.id = randomStr();
      this.setState({questions: [...this.state.questions, newQuestion],
                    showFunctions: [...this.state.showFunctions, false],
                    showQuestion: false,
                    newQuestion: {
                      name: '',
                      id: 0,
                      type: 0,
                      options: [],
                      hidden: false,
                      linkIndex: -1,
                      linkAnswer: []
                    }});
    }
    else {
      const questions = this.state.questions.slice();
      questions[i] = this.state.newQuestion;
      this.setState({questions,
                    updateQuestion: -1,
                    showQuestion: false,
                    newQuestion: {
                      name: '',
                      id: 0,
                      type: 0,
                      options: [],
                      hidden: false,
                      linkIndex: -1,
                      linkAnswer: []
                    }});
    }
  }



  handleQuestionIsHidden(linkIndex) {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.hidden = !newQuestion.hidden;
    if (!newQuestion.hidden) {
      newQuestion.linkIndex = -1;
      newQuestion.linkAnswer = [];
    } else {
      newQuestion.linkIndex = linkIndex;
    }
    this.setState({newQuestion});
  }

  changeNewQuestionLinkIndex(e) {
    const newQuestion = {...this.state.newQuestion};
    newQuestion.linkIndex = e.target.value;
    newQuestion.linkAnswer = [];
    this.setState({newQuestion});
  }

  setAnswerFoNewQuestion(addToExisting, index) {
    const newQuestion = {...this.state.newQuestion};
    if (addToExisting) {
      const i = newQuestion.linkAnswer.indexOf(index);
      ( i !== -1)  ? newQuestion.linkAnswer.splice(i, 1) : newQuestion.linkAnswer.push(index);
    } else
      newQuestion.linkAnswer = [index];
    this.setState({newQuestion});
  }

  showFunctionals(i, show) {
    const showFunctions = this.state.showFunctions.slice();
    showFunctions[i] = show;
    this.setState({showFunctions});
  }

  deleteQuestion(i) {
    let questions = this.state.questions.slice();
    const id = questions[i].id;
    console.log(questions);
    questions = questions.filter(function(question) {
        return question.linkIndex !== id;
    });
    questions.splice(i, 1);
    console.log(questions);
    this.setState({questions});
  }

  editQuestion(i) {
    if (this.state.showQuestion) {
      return this.setState({message:"Question might be update only after new question closing.", isError: false});
    }
    this.setState({updateQuestion:i, newQuestion: this.state.questions[i]});
  }


    changeDepId(e) {
      this.setState({depId: e.target.value});
    }

  moveQuestion(i, isUp) {
    let questions = this.state.questions.slice();
    const removedElement = questions.splice(i, 1)[0];
    console.log(removedElement);
    if (isUp) {
      questions.splice(--i, 0, removedElement);
    } else {
      questions.splice(++i, 0, removedElement);
    }
    this.setState({questions});
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

  renderLink() {
    const linkList = [];
    for (const q of this.state.questions) {
      if ((q.type === 2 || q.type === 3) && q.id !== this.state.newQuestion.id && q.linkIndex !== this.state.newQuestion.id) {
        linkList.push(q);
      }
    }
    if (linkList.length > 0) {
      const newQuestion = {...this.state.newQuestion};
      if (newQuestion.linkIndex === -1)
        newQuestion.linkIndex = linkList[0].id;

      return (
        <div>
          <label className="checkbox is-small">
            <input type="checkbox" checked={newQuestion.hidden} onChange={() => this.handleQuestionIsHidden(linkList[0].id)}/>
            Show question depending on the answer to another question
          </label>
          { newQuestion.hidden &&
            <div>
          <div className="select is-small">
            <select value={newQuestion.linkIndex}  onChange={this.changeNewQuestionLinkIndex}>
              {
                linkList.map((link, index) => {
                  return (
                        <option value={link.id} key={index}>{link.name}</option>
                  );
                })
              }
            </select>
          </div>
            <p>Choose option(s) that should be chosen to show this question.</p>
            {
              (this.state.questions.find(x => x.id === newQuestion.linkIndex).type === 2) &&
              (<p className="control">
              {this.state.questions.find(x => x.id === newQuestion.linkIndex).options.map((option, index) => {
                console.log(index);
                return (
                  <label className="radio" key={index}>
                    <input className="is-small" type="radio" name="answer" checked={(newQuestion.linkAnswer && newQuestion.linkAnswer.includes(index)) ? true : false} onChange={() => this.setAnswerFoNewQuestion(false, index)}/>
                    {option}
                  </label>
                )
              })}
            </p>)
            }
            {
              (this.state.questions.find(x => x.id === newQuestion.linkIndex).type === 3) &&
              (<p className="control">
              {this.state.questions.find(x => x.id === newQuestion.linkIndex).options.map((option, index) => {
                return (
                  <label className="checkbox is-small" key={index}>
                    <input type="checkbox" className="is-small"  defaultChecked={(newQuestion.linkAnswer && newQuestion.linkAnswer.includes(index)) ? true : false} onChange={() => this.setAnswerFoNewQuestion(true, index)}/>
                    {option}
                  </label>
                )
              })
            }
          </p>)
            }
          </div> }
        </div>
      );
    }
  }

  render() {
    return (
      <div className="content-wrapper">
            { this.state.message && <Message message={this.state.message} isError={this.state.isError} />}

            <nav className="level">
              <div className="level-left">
                  {!this.state.editName &&
                    <div className="level-item">
                      <h5 className="title is-5 mr-10">Questionnaire: {this.state.name}.</h5>
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
          <div className="questionnaire-content">
            {this.state.questions.map((q, i) => {
              if (this.state.updateQuestion !== i) {
                const linkedQ = this.state.questions.find(x => x.id === q.linkIndex);
                return (<Question key={i} index={i+1} question={q} link={(linkedQ) ? linkedQ.name : null} onMouseOver={() => this.showFunctionals(i, true)} edit={()=>this.editQuestion(i)} delete={() => this.deleteQuestion(i)} up={()=> this.moveQuestion(i, true)} down={()=> this.moveQuestion(i, false)} onMouseOut={()=>this.showFunctionals(i, false)} showFunctions={this.state.showFunctions[i]}/>);
              } else {
                  return (<UpdateQuestion key={i} newQuestion={this.state.newQuestion} changeNewQuestionName={this.changeNewQuestionName} changeNewQuestionType={this.changeNewQuestionType} deleteOption={this.deleteOption} addNewOption={this.addNewOption} changeOption={this.changeOption} renderLink={this.renderLink} showQuestion={() => this.showQuestion(false)} saveQuestion={() => this.saveQuestion(false, i)}/>)
              }
            })}
            {this.state.questions.length > 0 && <hr/>}
            {!this.state.showQuestion && <a className="button is-small is-info mt-20" onClick={() => this.showQuestion(true)}>Create question</a>}
            {this.state.showQuestion && <UpdateQuestion newQuestion={this.state.newQuestion} changeNewQuestionName={this.changeNewQuestionName} changeNewQuestionType={this.changeNewQuestionType} deleteOption={this.deleteOption} addNewOption={this.addNewOption} changeOption={this.changeOption} renderLink={this.renderLink} showQuestion={() => this.showQuestion(false)} saveQuestion={() => this.saveQuestion(true, -1)}/>}
          </div>
      </div>
    );
  }
}

function randomStr() {
	let s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i=0; i < 20; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
	return s;
};

export default connect(mapStateToProps)(Questionnaire)
