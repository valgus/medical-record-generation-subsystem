import React, { Component } from 'react'

import ReactQuill from 'react-quill';

// Accessing the Quill backing instance using React ref functions

class TemplateEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = { editorHtml: '', mountedEditor: false, notes: '', linkedQuestions: [] }
    this.quillRef = null;
    this.reactQuillRef = null;
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.attachQuillRefs = this.attachQuillRefs.bind(this);
    this.setChosenVariable = this.setChosenVariable.bind(this);
    this.handleChangedNotes = this.handleChangedNotes.bind(this);
    this.openDropDown = this.openDropDown.bind(this);
    this.closeDropDown = this.closeDropDown.bind(this);
  }

  componentDidMount () {
      this.attachQuillRefs();
      if (this.props.index > -1) {
        this.setState({notes: this.props.existingPart.notes, editorHtml: this.props.existingPart.delta, linkedQuestions: (this.props.existingPart.linkedQuestions) ? this.props.existingPart.linkedQuestions : [] });
      }
      var customButton = document.querySelector('.ql-insert');
      customButton.innerHTML = "<i class=\"fas fa-paste\"></i>";
      const _this = this;
      customButton.addEventListener('click', function() {
        if (_this.state.chosenQuestion) {
          var range = _this.quillRef.getSelection();
           let position = range ? range.index : 0;
           _this.quillRef.insertText(position, "--$" + _this.state.chosenQuestion.id.toString() + "--");
           let notes = _this.state.notes;
           if (notes.indexOf(_this.state.chosenQuestion.id) < 0) {
             notes = notes.replace("Inserted items:\n", "");
             notes =  "--$" + _this.state.chosenQuestion.id.toString() + "--: question \"" + _this.state.chosenQuestion.name + "\"\n" + notes;
             notes = "Inserted items:\n" + notes;
             const linkedQuestions = _this.state.linkedQuestions.slice();
             if (linkedQuestions.indexOf(_this.state.chosenQuestion.id) < 0) {
               linkedQuestions.push(_this.state.chosenQuestion.id);
             }
             _this.setState({notes, linkedQuestions});
           }
          }
        });
  }

  componentDidUpdate () {
    this.attachQuillRefs()
  }

  attachQuillRefs() {
    // Ensure React-Quill reference is available:
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    // Skip if Quill reference is defined:
    if (this.quillRef != null) return;

    const quillRef = this.reactQuillRef.getEditor();
    if (quillRef != null) this.quillRef = quillRef;
  }

  handleClick () {
    const Quill = require('quill');
    const deltaOps =  this.reactQuillRef.getEditor().getContents();
    const tempCont = document.createElement("div");
    (new Quill(tempCont)).setContents(deltaOps);

    const rawHtml = tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
    const html = convertToHtml(rawHtml);

    let linkedQuestions = this.state.linkedQuestions.slice();
    linkedQuestions = linkedQuestions.filter(question => rawHtml.indexOf(question) >= 0);
    console.log(linkedQuestions);
    if (this.props.index === -1)
      return this.props.save(html, rawHtml, linkedQuestions, this.state.notes, -1);
    return this.props.save(html, rawHtml, linkedQuestions, this.state.notes, this.props.index);
  }

  handleChangedNotes(e) {
    this.setState({notes: e.target.value});
  }

  handleChange (html) {
  	this.setState({ editorHtml: html });
    console.log(html);
  }

  setChosenVariable(id, name, questionnaireId) {
    this.setState({chosenQuestion: {id, name}});
    const dropdownMenu = document.getElementById(questionnaireId.toString());
    dropdownMenu.classList.remove('is-active');
  }

  openDropDown(e, id) {
    e.preventDefault();
    document.getElementById(id.toString()).classList.add('is-active')
  }

  closeDropDown(e, id) {
    e.preventDefault();
    document.getElementById(id.toString()).classList.remove('is-active')
  }

  render () {
    return (
      <div>
      {this.props.questionnaires && this.props.questionnaires.length > 0 &&
        <div>
          <p>Choose values that will be auto filled in the template:</p>
          { this.props.questionnaires.map((qn) => {
            return (
              <div className="dropdown" key={qn.id} id={qn.id}>
                <div className="dropdown-trigger">
                  <button className="button is-small"
                          aria-haspopup="true"
                          aria-controls={"dropdown-menu" + qn.id.toString()}
                          onClick={(e) => this.openDropDown(e, qn.id)}
                    >
                    <span>{qn.name}</span>
                    <span className="icon is-small">
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </button>
                </div>
                <div className="dropdown-menu" id={"dropdown-menu" + qn.id.toString()} role="menu" onMouseLeave={(e) => {this.closeDropDown(e, qn.id)}}>
                  <div className="dropdown-content">
                    {qn.questions.map((q) => {
                      return (
                        <a key={q.id} className="dropdown-item is-small" onClick={() => this.setChosenVariable(q.id, q.name, qn.id)}>
                          {q.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

            );
          })}
          {this.state.chosenQuestion && <p className="mb-5">Chosen item: {this.state.chosenQuestion.name}. Click in the editor field to insert this item.</p>}
        </div>
      }
      <ReactQuill
        ref={(el) => { this.reactQuillRef = el }}
        theme={'snow'}
        onChange={this.handleChange}
        modules={TemplateEditor.modules}
        formats={TemplateEditor.formats}
        defaultValue={(this.props.index > -1) ? this.props.existingPart.delta : this.props.editorHtml}
        placeholder="Enter text"
        />
        <p>Enter some notes for the employees to give them advice how to change this part of the template.</p>
        <div className="field">
          <div className="control">
            <textarea className="textarea is-small" defaultValue={(this.props.index > -1) ? this.props.existingPart.notes : this.state.notes} value={this.state.notes} rows="4" type="text" onChange={this.handleChangedNotes}/>
          </div>
        </div>
        <div className="field is-grouped mt-20 mb-20">
          <p className="control">
            <a className="button is-small is-light"  onClick={this.props.cancel}>Cancel</a>
          </p>
          <p className="control">
            <a className="button is-small is-info" onClick={this.handleClick}>Add</a>
          </p>
        </div>
       </div>
     )
  }
}

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
TemplateEditor.modules = {}
TemplateEditor.modules.toolbar = [
  ['insert'],
  [{ 'header': [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline','strike'],
  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image']
],


/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
TemplateEditor.formats = [
  'insert',
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background',
    'font',
    'align',
    'link', 'image'
  ]

function convertToHtml(str) {
  str = str.replace(/class=/g, 'style=');
  str = str.replace(/ql-align-center/g, "text-align: center;" );
  str = str.replace(/ql-align-right/g, "text-align: right;" );
  str = str.replace(/ql-indent-1/g, "margin-left: 0.49in;" );
  str = str.replace(/ql-indent-2/g, "margin-left: 0.98in;" );
  str = str.replace(/ql-indent-3/g, "margin-left: 1.48in;" );
  str = str.replace(/ql-indent-4/g, "margin-left: 1.97in;" );
  str = str.replace(/ql-indent-5/g, "margin-left: 2.46in;" );
  str = str.replace(/ql-indent-6/g, "margin-left: 2.95in;" );
  str = str.replace(/ql-indent-7/g, "margin-left: 3.44in;" );
  str = str.replace(/ql-indent-8/g, "margin-left: 3.93in;" );
  str = str.replace(/ql-indent-9/g, "margin-left: 4.43in;" );
  str = str.replace(/ql-indent-10/g, "margin-left: 4.92in;" );
  str = str.replace(/ql-indent-11/g, "margin-left: 5.41in;" );
  str = str.replace(/ql-indent-12/g, "margin-left: 5.9in;" );
  str = str.replace(/ql-indent-13/g, "margin-left: 6.39in;" );
  str = str.replace(/ql-indent-14/g, "margin-left: 6.88in;" );
  str = str.replace(/ql-indent-15/g, "margin-left: 7.38in;" );
  str = str.replace(/ql-indent-15/g, "margin-left: 8.36in;" );
  str = str.replace(/ql-font-monospace/g, "font-family: monospace;");
  str = str.replace(/ql-font-serif/g, "font-family: serif;" );
  str = str.replace(/<ul/g, "<ul style='list-style-position: inside;'" );

  str = str.replace(/\" style=\"/g, ' '); //second occurance od style after previous replacements

  return str;
}

export default TemplateEditor;
