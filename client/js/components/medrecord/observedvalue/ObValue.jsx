

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'
import Message from '../../shared/Message.jsx'
import Inputs from '../Inputs.jsx'
import IntervalInputs from '../IntervalInputs.jsx'

import medrecService from '../../../services/medrec.js'
import departmentService from '../../../services/department.js'
import Loading from '../../Loading.jsx'

function mapStateToProps (state) {
  return {
    user: state.user
  }
}


class ObValue extends Component {


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
        period: 3600000,
        frequency: '',
        values: [''],
        critical: [],
        visibleNominal: true,
        visibleOrdinal: false,
        visibleScale: false,
        showGraph: false,
        valueType: 0
      }
      this.editName = this.editName.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.setName = this.setName.bind(this);
      this.deleteValue = this.deleteValue.bind(this);
      this.addNewValue = this.addNewValue.bind(this);
      this.changeValue = this.changeValue.bind(this);
      this.handleValueTypeChange = this.handleValueTypeChange.bind(this);
      this.handleCritical = this.handleCritical.bind(this);
      this.handleInterval = this.handleInterval.bind(this);
      this.addIntervalCriticalValue = this.addIntervalCriticalValue.bind(this);
      this.deleteIntervalCrititcalValue = this.deleteIntervalCrititcalValue.bind(this);
      this.changeIntervalCrititcalValue = this.changeIntervalCrititcalValue.bind(this);
      this.changeShowGraph = this.changeShowGraph.bind(this);
      this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
      this.handlePeriodChange = this.handlePeriodChange.bind(this);
      this.save = this.save.bind(this);
      this.changeDepId = this.changeDepId.bind(this);
      this.clone  = this.clone.bind(this);
  }

  componentDidMount() {
  this.setState({message: null, loading: true, isError: false});
    medrecService.getObValue(this.props.params.id, (err, res) => {
      if(err){
        console.log(err);
        this.setState({
          loading: false, message: "The problem with folder information occured.", isError: true
        });
        return;
      }
      console.log(res);
      this.setState({loading: false, name: res.ov.name});
      if (res.ov.period) { //if the observed value was previously created
          this.setState({
            valueType: res.ov.type,
            values: res.ov.values,
            critical: res.ov.critical,
            showGraph: res.ov.showGraph,
            visibleNominal: (res.ov.critical.length === 0),
            visibleOrdinal: res.ov.critical.length > 0 && !(res.ov.critical[0] instanceof Object),
            visibleScale: (res.ov.critical[0] instanceof Object),
            period: res.ov.period,
            frequency: res.ov.frequency/res.ov.period
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
    const data = {
      _id: this.props.params.id,
      frequency: this.state.frequency*this.state.period,
      period: this.state.period,
      type: this.state.valueType,
      values: this.state.values,
      critical: this.state.critical,
      showGraph: this.state.showGraph
    };
    this.setState({message: null, loading: true, isError: false});
      medrecService.saveObValue(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with observed value saving occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "Observed value was saved."});
      });
  }

  clone() {
    const data = {
      _id: this.state.depId,
      name: this.state.name,
      frequency: this.state.frequency*this.state.period,
      period: this.state.period,
      type: this.state.valueType,
      values: this.state.values,
      critical: this.state.critical,
      showGraph: this.state.showGraph
    };
    this.setState({message: null, loading: true, isError: false});
      medrecService.cloneObValue(data, (err, res) => {
        if(err){
          console.log(err);
          this.setState({
            loading: false, message: "The problem with observed value cloning occured.", isError: true
          });
          return;
        }
        this.setState({loading: false, message: "Observed value was cloned."});
      });
  }

  deleteValue(i) {
    const values = this.state.values;
    values.splice(i, 1);
    this.setState({ values: values });
    if (this.state.valueType === 1) {
      const critical = this.state.critical;
      critical.splice(i, 1);
      this.setState({ critical: critical });
    }

  }

  addNewValue() {
    this.setState({values: [...this.state.values, ""] });
    //if there is an orinal type of value, the new critical should also be added
    if (this.state.valueType ===1) {
      this.setState({critical: [...this.state.critical, false] });
    }
  }

  changeValue(e, i) {
    const values = this.state.values;
    values[i] = e.target.value;
    this.setState({ values: values });
    console.log(this.state.values);
  }

  handleValueTypeChange(e) {
    const newValue = parseInt(e.target.value);
    this.setState({valueType: newValue});
    switch (newValue) {
      case 0: this.setState({visibleNominal: true, visibleOrdinal: false, showGraph: false, visibleScale: false, critical: [], values: ['']}); break;
      case 1: this.setState({visibleNominal: true, visibleOrdinal: true, showGraph: false, visibleScale: false, critical: [false], values: ['']}); break;
      case 2: this.setState({visibleNominal: false, visibleOrdinal: false, showGraph: true, visibleScale: true, critical: [{min: '', max: ''}], values: [{min: '', max: ''}]}); break;
    }
  }

  handleCritical(i) {
    const critical = this.state.critical;
    critical[i] = !critical[i];
    this.setState({ critical: critical });
  }

  handleInterval(e, type) {
    const values = this.state.values;
    values[0][type] = e.target.value;
    this.setState({values: values});
  }

  addIntervalCriticalValue() {
      this.setState({critical: [...this.state.critical, {min:"", max: ""}] });
  }

  deleteIntervalCrititcalValue(i) {
    const critical = this.state.critical;
    critical.splice(i, 1);
    this.setState({ critical: critical });
  }

  changeIntervalCrititcalValue(e, i, type) {
    const critical = this.state.critical;
    critical[i][type] = e.target.value;
    this.setState({ critical: critical });
  }

  changeShowGraph() {
    this.setState({showGraph: !this.state.showGraph});
  }

  handleFrequencyChange(e) {
    this.setState({frequency: e.target.value});
  }

  handlePeriodChange(e) {
    this.setState({period: parseInt(e.target.value)});
  }

    changeDepId(e) {
      this.setState({depId: e.target.value});
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
                    <h5 className="title is-5 mr-10">Observed value: {this.state.name}.</h5>
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
          <p>Set settings for the observed value.</p>

            <div className="field is-horizontal">
              <div className="field-label is-small">
                <label className="label">Frequency of data update: every</label>
              </div>
              <div className="field-body">
                <div className="field has-addons">
                  <p className="control">
                    <input className="input is-small" value={this.state.frequency} onChange={this.handleFrequencyChange} type="number"/>
                  </p>
                  <p className="control">
                    <span className="select  is-small">
                      <select value={this.state.period} onChange={this.handlePeriodChange}>
                        <option value="3600000">hours</option>
                        <option value="86400000">days</option>
                        <option value="604800000">weeks</option>
                      </select>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <br />
            <div className="field is-horizontal">
              <div className="field-label is-small">
                <label className="label">The type of the observed value is: </label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <div className="select is-small">
                      <select value={this.state.valueType} onChange={this.handleValueTypeChange}>
                        <option value="0">nominal</option>
                        <option value="1">ordinal</option>
                        <option value="2">interval</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <label className=" is-small">Set possible values for the observed value:</label>
            {this.state.visibleOrdinal && <p className="is-small">* Check those values that are critical for this value.</p>}
            {(this.state.visibleNominal || this.state.visibleOrdinal) && (<Inputs arr={this.state.values} critical={this.state.critical} ordinal = {this.state.visibleOrdinal} enabled={true} handleCritical={this.handleCritical} onDelete={this.deleteValue} onAdd={this.addNewValue} onChange={this.changeValue}/>)}
            { this.state.visibleScale && (
              <div>
              <div className="field is-horizontal inputs-container">
              <div className="field-label is-small">
                <label className="label">From:</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control">
                    <input className="input is-small" value={this.state.values[0].min} type="number" onChange={(e) => this.handleInterval(e, "min")} placeholder="Min value"/>
                  </p>
                </div>
                <div className="field-label is-small">
                  <label className="label">To:</label>
                </div>
                <div className="field">
                  <p className="control">
                    <input className="input  is-small" value={this.state.values[0].max} type="number" onChange={(e) => this.handleInterval(e, "max")} placeholder="Max value"/>
                  </p>
                </div>
              </div>
            </div>
            <br/>
            <label className=" is-small">Set possible values that are critical for the observed value:</label>
            <IntervalInputs arr={this.state.critical} onDelete={this.deleteIntervalCrititcalValue} onAdd={this.addIntervalCriticalValue} onChange={this.changeIntervalCrititcalValue}/>
            <br/>
            <label className="checkbox">
                <input type="checkbox" checked={this.state.showGraph} onChange={this.changeShowGraph} />
                Construct chart based on the data
              </label>
        </div>
            )}

</div>
    );
  }
}

export default connect(mapStateToProps)(ObValue)
