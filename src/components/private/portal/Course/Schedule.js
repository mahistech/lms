import React from "react"
import { Container, Row, Col, Table, Alert, Button } from 'react-bootstrap'
import { Redirect } from "react-router-dom";
import UserNavBar from "../../../general/UserNavbar"
import Loading from "../../../general/Loading"
import BasicTable from "../../general/BasicTable"
import AddForm from "../../general/AddForm"
import { portalCourseSchedule, portalAddSchedule, portalUpdateSchedule } from "../../apis/portalApis"
import { corsOptionsGET, corsOptionsPOST, apiURL } from "../../../config/config"


class Schedule extends React.Component {

    constructor() {
        super()
        this.state = {
            username: null,
            isLoading: true,
            schedule: null,
            addButtonClicked: false,
            scheduleFileInput: null,
            message: null,
            isErrorMessage: null
        }
        this.handleAddSubmit = this.handleAddSubmit.bind(this)
        this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this)
        this.onPlusButtonClick = this.onPlusButtonClick.bind(this)
        this.handleScheduleFileChange = this.handleScheduleFileChange.bind(this)
    }

    callAPI() {
        fetch(portalCourseSchedule(this.props.match.params.course), {
            method: corsOptionsGET.method, 
            mode: corsOptionsGET.mode,
            credentials: corsOptionsGET.credentials,
            headers: { 
                "Content-Type": corsOptionsGET.headers["Content-Type"],
                "Access-Control-Allow-Origin": corsOptionsGET.headers["Access-Control-Allow-Origin"],
                "Access-Control-Allow-Methods": corsOptionsGET.headers["Access-Control-Allow-Methods"],
                "Access-Control-Allow-Credentials": corsOptionsGET.headers["Access-Control-Allow-Credentials"]
            }
        })
        .then(res => this.processResponse(res))
        .then(res => {
            const { statusCode, data } = res;
            this.processData(statusCode, data)
        })
        .catch(error => {
            console.error(error);
        });
    }

    componentDidMount() {
        this.callAPI();
    }

    processResponse(response) {
        const statusCode = response.status;
        const data = response.json();
        return Promise.all([statusCode, data]).then(res => ({
          statusCode: res[0],
          data: res[1]
        }));
    }

    processData(statusCode, data) {
        switch(statusCode) {
            case 200:
               let username = data.username
               let schedule = data.schedule
               this.setState({
                   username: username,
                   schedule: schedule,
                   isLoading: false
               })
               break;

            case 401:
                this.props.history.push('/login')
                break;

            default: 
                console.log("unregistered status code")
        }
    }

    // button functions

    onPlusButtonClick(event) {

        event.preventDefault()

        // check if + is hit first
        if (!this.state.addButtonClicked) {
            // open the form 
            this.setState({addButtonClicked: true})
        }        
    }

    // add schedule fields

    handleScheduleFileChange(event) {
        let file = event.target.files[0]
        this.setState({scheduleFileInput: file})
    }

    // submit function

    handleAddSubmit(event) {
        event.preventDefault()

        let formData = new FormData();
        formData.append('uploadFile', this.state.scheduleFileInput)
        formData.append('course', this.state.schedule.course)

        // send the response to the server 
        fetch(portalAddSchedule(), {
            method: corsOptionsPOST.method, 
            mode: corsOptionsPOST.mode,
            credentials: corsOptionsPOST.credentials,
            headers: { 
                "Access-Control-Allow-Origin": corsOptionsPOST.headers["Access-Control-Allow-Origin"],
                "Access-Control-Allow-Methods": corsOptionsPOST.headers["Access-Control-Allow-Methods"],
                "Access-Control-Allow-Credentials": corsOptionsPOST.headers["Access-Control-Allow-Credentials"]
            },
            body: formData
        })
        .then(res => this.processResponse(res))
        .then(res => {
            const { statusCode, data } = res;
            this.processSubmitData(statusCode, data)
        })
        .catch(error => {
            console.error(error);
        });

    }

    handleUpdateSubmit(event) {
        event.preventDefault()

        let formData = new FormData();
        formData.append('scheduleFileID', this.state.schedule.fileID) // old file id
        formData.append('uploadFile', this.state.scheduleFileInput)
        formData.append('course', this.state.schedule.course)

        // send the response to the server 
        fetch(portalUpdateSchedule(), {
            method: corsOptionsPOST.method, 
            mode: corsOptionsPOST.mode,
            credentials: corsOptionsPOST.credentials,
            headers: { 
                "Access-Control-Allow-Origin": corsOptionsPOST.headers["Access-Control-Allow-Origin"],
                "Access-Control-Allow-Methods": corsOptionsPOST.headers["Access-Control-Allow-Methods"],
                "Access-Control-Allow-Credentials": corsOptionsPOST.headers["Access-Control-Allow-Credentials"]
            },
            body: formData
        })
        .then(res => this.processResponse(res))
        .then(res => {
            const { statusCode, data } = res;
            this.processSubmitData(statusCode, data)
        })
        .catch(error => {
            console.error(error);
        });

    }
    
    processSubmitData(statusCode, data) {

        var message;

        switch(statusCode) {
            case 200: 
                message = data.message
                let schedule = data.schedule

                this.setState({
                    schedule: schedule,
                    isLoading: false,
                    addButtonClicked: false,
                    scheduleFileInput: null,
                    message: message,
                    isErrorMessage: false
                })
                break;

            case 401:
                this.props.history.push('/login')
                break;

            case 403:
                
                message = data.message
                this.setState({
                    message: message,
                    isErrorMessage: true
                })
                break;

            case 500:

                message = data.message
                this.setState({
                    message: message,
                    isErrorMessage: true
                })
                break;

            case 505:
            
                message = data.message
                this.setState({
                    message: message,
                    isErrorMessage: true
                })
                break;
            default: 
                console.log("unregistered status code")
        }

    }
    
    render() {

        if (!this.state.isLoading) {

            if (this.state.schedule) {

                let alert;

                if (this.state.isErrorMessage == true) {
                    alert = <Alert variant="danger">
                                {`${this.state.message}`}
                            </Alert>
                } else if (this.state.isErrorMessage == false) {
                    alert = <Alert variant="success">
                                {`${this.state.message}`}
                            </Alert>
                }

                let formGroups = [
                    {
                        controlId: "ScheduleFile",
                        type: "file",
                        name: "uploadfile",
                        onChange: this.handleScheduleFileChange
                    }
                ]

                let title = "Schedule for " + this.state.schedule.fullCourseName + ": " + this.state.schedule.course
                console.log("schedule: " + this.state.schedule.schedule)
                // we have a previously uploaded schedule 
                if (this.state.schedule.schedule.fileID !== undefined) {

                    return (
                        <>
                        <UserNavBar isLoggedIn={true} username={this.state.username}></UserNavBar>
                        <Container fluid>
                            {alert}
                            
                            <Row>
                                <Col xs={12}>
                                    <h1>{title}</h1>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <Table striped bordered hover>
                                    <thead>
                                      <tr>
                                        <th>Current Schedule</th>
                                        <th>Date Uploaded</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td><a href={`${apiURL}/teacher/${this.state.username}/course/${this.props.match.params.course}/schedule/id/${this.state.schedule.schedule.fileID}/files/${this.state.schedule.schedule.scheduleFile}`}>{`Current Schedule`} </a></td>
                                        <td>{this.state.schedule.schedule.uploadDate}</td>
                                      </tr>
                                    </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <AddForm 
                                pressed={this.state.addButtonClicked} 
                                updateForm={true}
                                handleSubmit={this.handleUpdateSubmit}
                                formGroups={formGroups}
                                buttonName={`update schedule`}
                                onClick={this.onPlusButtonClick}
                            >
                            </AddForm>
                            
                        </Container>
                        </>
                    )

                } else {

                    // there is no previous uploaded schedule
                    return (
                        <>
                        <UserNavBar isLoggedIn={true} username={this.state.username}></UserNavBar>
                        <Container fluid>
                            {alert}
                            <Row>
                                <Col xs={12}>
                                    <h1>{title}</h1>
                                </Col>
                            </Row>
                            <AddForm 
                                pressed={this.state.addButtonClicked} 
                                handleSubmit={this.handleAddSubmit}
                                formGroups={formGroups}
                                buttonName={`add schedule`}
                                onClick={this.onPlusButtonClick}
                            >
                            </AddForm>
                        </Container>
                        </>
                    )

                }

            } else {

                return (
                    <Redirect to={`${this.props.location.pathname}/404`}/>
                )

            }
        } else {
            return (
                <Loading></Loading>
            )
        }
    }

}

export default Schedule