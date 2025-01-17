import React, { Component } from 'react';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { Select } from '../common';
import { showError, Progressing, getTeamListMin as getProjectListMin, Drawer, CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { ViewType } from '../../config/constants';
import { toast } from 'react-toastify';
import { saveSlackConfiguration, updateSlackConfiguration, getSlackConfiguration } from './notifications.service';
import { ReactComponent as Help } from '../../assets/icons/ic-help-outline.svg';
import Tippy from '@tippyjs/react';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg';
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging';

export interface SlackConfigModalProps {
    slackConfigId: number;
    onSaveSuccess: () => void;
    closeSlackConfigModal: (event) => void;
}

export interface SlackConfigModalState {
    view: string;
    projectList: Array<{ id: number; name: string; active: boolean; }>;
    form: {
        projectId: number;
        configName: string;
        webhookUrl: string;
        isLoading: boolean;
        isError: boolean;
    };
    isValid: {
        projectId: boolean;
        configName: boolean;
        webhookUrl: boolean;
    }
}

export class SlackConfigModal extends Component<SlackConfigModalProps, SlackConfigModalState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            projectList: [],
            form: {
                projectId: 0,
                configName: "",
                webhookUrl: "",
                isLoading: false,
                isError: false,
            },
            isValid: {
                projectId: true,
                configName: true,
                webhookUrl: true,
            }
        }
        this.handleSlackChannelChange = this.handleSlackChannelChange.bind(this);
        this.handleWebhookUrlChange = this.handleWebhookUrlChange.bind(this);
        this.handleProjectChange = this.handleProjectChange.bind(this);
        this.isValid = this.isValid.bind(this);
        this.onSaveClickHandler = this.onSaveClickHandler.bind(this);
    }

    componentDidMount() {
        if (this.props.slackConfigId) {
            Promise.all([getSlackConfiguration(this.props.slackConfigId), getProjectListMin()]).then(([slackConfigRes, projectListRes]) => {
                let state = { ...this.state };
                state.view = ViewType.FORM;
                state.projectList = projectListRes.result || []
                state.form = { ...slackConfigRes.result };
                state.isValid = {
                    projectId: true,
                    configName: true,
                    webhookUrl: true,
                }
                this.setState(state);
            }).catch((error) => {
                showError(error);
            })
        }
        else {
            getProjectListMin().then((response) => {
                this.setState({
                    projectList: response.result || [],
                    view: ViewType.FORM
                })
            }).catch((error) => {
                showError(error);
            })
        }
    }

    handleSlackChannelChange(event: React.ChangeEvent<HTMLInputElement>,): void {
        let { form } = { ...this.state };
        form.configName = event.target.value;
        this.setState({ form });
    }

    isValid(event, key: 'configName' | 'webhookUrl' | 'projectId'): void {
        let { form, isValid } = { ...this.state };
        if (key === 'projectId') isValid[key] = event.target.value;
        else isValid[key] = event.target.value.length !== 0;
        this.setState({ form, isValid });
    }

    handleWebhookUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form } = { ...this.state };
        form.webhookUrl = event.target.value;
        this.setState({ form });
    }

    handleProjectChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        form.projectId = Number(event.target.value);
        isValid.projectId = !!event.target.value;
        this.setState({ form, isValid });
    }

    saveSlackConfig(): void {
        let state = { ...this.state };
        state.form.isLoading = true;
        state.isValid.projectId = !!state.form.projectId;
        this.setState(state);
        let keys = Object.keys(this.state.isValid);
        let isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key];
            return isFormValid;
        }, true);

        if (!isFormValid) {
            state.form.isLoading = false;
            state.form.isError = true;
            this.setState(state);
            return;
        }
        let requestBody = this.state.form;
        if (this.props.slackConfigId) requestBody['id'] = this.props.slackConfigId;
        let promise = this.props.slackConfigId ? updateSlackConfiguration(requestBody) : saveSlackConfiguration(requestBody);
        promise.then((response) => {
            let state = { ...this.state };
            state.form.isLoading = false;
            state.form.isError = false;
            this.setState(state);
            toast.success("Saved Successfully");
            this.props.onSaveSuccess();
        }).catch((error) => {
            showError(error);
        })
    }

    renderWithBackdrop(body) {
        return <Drawer position="right">
            <div className="h-100 modal__body modal__body--w-600 modal__body--p-0 dc__no-border-radius mt-0">
                <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure Slack</h1>
                    <button type="button" className="dc__transparent" onClick={this.props.closeSlackConfigModal}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                {body}
            </div>
        </Drawer>
    }

    onSaveClickHandler(event) {
        event.preventDefault();
        this.saveSlackConfig()
    }

    render() {
        let project = this.state.projectList.find(p => p.id === this.state.form.projectId);
        let body;
        if (this.state.view === ViewType.LOADING) {
            body = <div style={{ height: "350px" }}>
                <Progressing pageLoader />
            </div>
        }
        else body = <>
            <div className="m-20" style={{ height: 'calc(100vh - 160px' }}>
                <label className="form__row">
                        <CustomInput
                            data-testid="add-slack-channel"
                            label="Slack Channel"
                            name="app-name"
                            value={this.state.form.configName}
                            onChange={this.handleSlackChannelChange}
                            handleOnBlur={(event) => this.isValid(event, 'configName')}
                            placeholder="channel name"
                            autoFocus={true}
                            tabIndex={1}
                            isRequiredField={true}
                            error={!this.state.isValid.configName && REQUIRED_FIELD_MSG}
                        />
                </label>
                <label className="form__row">
                    <span className="form__label dc__required-field">Webhook URL
                        <Tippy className="default-tt" arrow={true} trigger={"click"}
                            interactive={true}
                            placement="top" content={
                                <a href="https://slack.com/intl/en-gb/help/articles/115005265063-Incoming-webhooks-for-Slack" target="_blank" rel="noopener noreferrer"
                                    style={{ color: "white", textTransform: "none" }}>
                                    Learn how to setup slack webhooks
                                </a>
                            }>
                            <Help className="ml-5 dc__vertical-align-middle icon-dim-16 cursor" />
                        </Tippy>
                    </span>
                           <CustomInput
                                data-testid="add-webhook-url"
                                type="text"
                                name="app-name"
                                value={this.state.form.webhookUrl}
                                placeholder="Enter Incoming Webhook URL"
                                tabIndex={2}
                                onChange={this.handleWebhookUrlChange}
                                handleOnBlur={(event) => this.isValid(event, 'webhookUrl')}
                                isRequiredField={true }
                                error={!this.state.isValid.webhookUrl && REQUIRED_FIELD_MSG}
                            />
                </label>
                <div>
                    <label className="form__label dc__required-field">Project
                        <Tippy className="default-tt" arrow={true} trigger={"click"}
                            interactive={true} placement="top" content="Required to control user Acccess">
                            <Help className="ml-5 dc__vertical-align-middle icon-dim-16 cursor" />
                        </Tippy>
                    </label>
                    <Select value={this.state.form.projectId} onChange={this.handleProjectChange} tabIndex={3} rootClassName="select-button--default">
                        <Select.Button dataTestIdDropdown="slack-select-project-button">{project ? project.name : "Select Project"}</Select.Button>
                        {this.state.projectList.map((p) => {
                            return <Select.Option dataTestIdMenuList={p.name} key={p.id} value={p.id}>{p.name}</Select.Option>
                        })}
                    </Select>
                    <span className="form__error">
                        {!this.state.isValid.projectId
                            ? <><Error className="form__icon form__icon--error" />This is as required field. <br /></>
                            : null}
                    </span>
                </div>
            </div>
            <div className="form__button-group-bottom flex right">
                <div className="flex right">
                    <button type="button" className="cta cancel mr-16" tabIndex={5}
                        onClick={this.props.closeSlackConfigModal}>Cancel
                    </button>
                    <button onClick={this.onSaveClickHandler} data-testid="add-slack-save-button" type="submit" className="cta" tabIndex={4} disabled={this.state.form.isLoading}>
                        {this.state.form.isLoading ? <Progressing /> : "Save"}
                    </button>
                </div>
            </div>
        </>

        return this.renderWithBackdrop(body);
    }
}