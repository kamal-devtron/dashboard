import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { VisibleModal, showError, stopPropagation, WorkflowNodeType, PipelineType, } from '@devtron-labs/devtron-fe-common-lib'
import selectWorkflowSource from '../../assets/img/select-image-source.png'
import changeCI from '../../assets/img/change-source.png'
import {
    NO_ENV_FOUND,
    SOURCE_TYPE_CARD_VARIANTS,
    WORKFLOW_OPTIONS_MODAL,
    WORKFLOW_OPTIONS_MODAL_TYPES,
    TOAST_MESSAGES,
    CHANGE_SAME_CI,
    REQUEST_IN_PROGRESS,
} from './workflowEditor.constants'
import SourceTypeCard from './SourceTypeCard'
import { ChangeCIPayloadType, DisableType, WorkflowOptionsModalProps } from './types'
import { CIPipelineNodeType } from '../app/details/triggerView/types'
import { importComponentFromFELibrary } from '../common'
import { saveCDPipeline } from '../cdPipeline/cdPipeline.service'
import { TriggerType } from '../../config'

const LINKED_CD_SOURCE_VARIANT = importComponentFromFELibrary('LINKED_CD_SOURCE_VARIANT', null, 'function')

export default function WorkflowOptionsModal({
    handleCloseWorkflowOptionsModal,
    addCIPipeline,
    addWebhookCD,
    addLinkedCD,
    showLinkedCDSource,
    changeCIPayload,
    workflows,
    getWorkflows,
}: Readonly<WorkflowOptionsModalProps>) {
    const [currentCIPipelineType, setCurrentCIPipelineType] = useState<CIPipelineNodeType | null>(null)
    const [loadingWebhook, setLoadingWebhook] = useState<boolean>(false)

    useEffect(() => {
        if (changeCIPayload && workflows) {
            const currentWorkflow = workflows.find((workflow) => +workflow.id === changeCIPayload?.appWorkflowId)
            const currentCIPipeline = currentWorkflow?.nodes.find((node) => node.type === WorkflowNodeType.CI)
            if (currentCIPipeline?.isJobCI) {
                setCurrentCIPipelineType(CIPipelineNodeType.JOB_CI)
            } else if (currentCIPipeline?.isLinkedCI) {
                setCurrentCIPipelineType(CIPipelineNodeType.LINKED_CI)
            } else if (currentCIPipeline?.isExternalCI) {
                setCurrentCIPipelineType(CIPipelineNodeType.EXTERNAL_CI)
            } else if (currentCIPipeline?.isLinkedCD) {
                setCurrentCIPipelineType(CIPipelineNodeType.LINKED_CD)
            } else {
                setCurrentCIPipelineType(CIPipelineNodeType.CI)
            }
        }
    }, [workflows, changeCIPayload])

    const getWebhookPayload = (changeCIPayload: ChangeCIPayloadType) => ({
        appId: changeCIPayload.appId,
        pipelines: [
            {
                // name and triggerType are useless to backend for this case
                name: 'change-webhook-ci',
                triggertype: TriggerType.Manual,
                appWorkflowId: changeCIPayload.appWorkflowId,
                environmentId: -1,
                id: 0,
                parentPipelineType: PipelineType.WEBHOOK,
                switchFromCiPipelineId: changeCIPayload.switchFromCiPipelineId,
            },
        ],
    })

    const handleChangeToWebhook = () => {
        if (changeCIPayload) {
            const currentWorkflow = workflows.find((workflow) => +workflow.id === changeCIPayload.appWorkflowId)
            // This is in case when we already have deployments in workflow in the current workflow
            const containsCDPipeline = currentWorkflow.nodes.some((node) => node.type === WorkflowNodeType.CD)
            if (containsCDPipeline) {
                // Only need to disable it in case of error
                setLoadingWebhook(true)
                saveCDPipeline(getWebhookPayload(changeCIPayload))
                    .then((response) => {
                        if (response.result) {
                            toast.success(TOAST_MESSAGES.SUCCESS_CHANGE_TO_WEBHOOK)
                            getWorkflows()
                            handleCloseWorkflowOptionsModal()
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        setLoadingWebhook(false)
                    })
                return
            }

            addWebhookCD(changeCIPayload.appWorkflowId)
        }
        addWebhookCD(0)
        handleCloseWorkflowOptionsModal()
    }

    const handleCardAction = (e: React.MouseEvent | React.KeyboardEvent) => {
        if (!(e.currentTarget instanceof HTMLDivElement)) {
            return
        }

        if ('key' in e && e.key !== 'Enter') {
            return
        }

        e.stopPropagation()
        const pipelineType = e.currentTarget.dataset.pipelineType

        if (pipelineType === PipelineType.WEBHOOK) {
            handleChangeToWebhook()
            return
        }

        if (LINKED_CD_SOURCE_VARIANT && pipelineType === LINKED_CD_SOURCE_VARIANT.type) {
            addLinkedCD(changeCIPayload)
            handleCloseWorkflowOptionsModal()
            return
        }

        addCIPipeline(pipelineType as CIPipelineNodeType, changeCIPayload?.appWorkflowId ?? 0)
        handleCloseWorkflowOptionsModal()
    }

    const getDisabledInfo = (requiredCIPipelineType: CIPipelineNodeType) => {
        if (!showLinkedCDSource && requiredCIPipelineType === CIPipelineNodeType.LINKED_CD) {
            return NO_ENV_FOUND
        }

        if (currentCIPipelineType === requiredCIPipelineType) {
            return CHANGE_SAME_CI
        }

        if (
            currentCIPipelineType &&
            requiredCIPipelineType !== CIPipelineNodeType.CI &&
            requiredCIPipelineType !== CIPipelineNodeType.LINKED_CD
        ) {
            return DisableType.COMING_SOON
        }

        if (loadingWebhook) {
            return REQUEST_IN_PROGRESS
        }

        return null
    }

    return (
        <VisibleModal
            className=""
            onEscape={loadingWebhook ? null : handleCloseWorkflowOptionsModal}
            close={loadingWebhook ? null : handleCloseWorkflowOptionsModal}
        >
            <div className="workflow-options-modal br-8 flexbox h-500 dc__overflow-scroll" onClick={stopPropagation}>
                {/* Sidebar */}
                <div className="flexbox-col w-250 pt-32 dc__window-bg dc__content-space">
                    {/* Info */}
                    <div className="flexbox-col dc__gap-6 dc__align-self-stretch pt-0 pb-0 pl-24 pr-24">
                        <p className="m-0 cn-9 fs-16 fw-6 lh-24">
                            {changeCIPayload
                                ? WORKFLOW_OPTIONS_MODAL.CHANGE_CI_TEXT
                                : WORKFLOW_OPTIONS_MODAL.ACTION_TEXT}
                        </p>

                        <p className="m-0 cn-7 fs-13 fw-4 lh-20">
                            {changeCIPayload
                                ? WORKFLOW_OPTIONS_MODAL.CHANGE_CI_NOTE
                                : WORKFLOW_OPTIONS_MODAL.ACTION_NOTE}
                        </p>
                    </div>

                    <img
                        src={changeCIPayload ? changeCI : selectWorkflowSource}
                        alt="workflow-action"
                        width={250}
                        height={350}
                    />
                </div>

                {/* Content */}
                <div className="flexbox-col p-20 dc__gap-12 dc__overflow-scroll">
                    <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                        <p className="m-0 cn-7 fs-11 fw-6 lh-16 dc__uppercase">
                            {WORKFLOW_OPTIONS_MODAL_TYPES.DEFAULT}
                        </p>

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.type}
                            handleCardAction={handleCardAction}
                            disableInfo={getDisabledInfo(CIPipelineNodeType.CI)}
                        />

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.type}
                            handleCardAction={handleCardAction}
                            disableInfo={getDisabledInfo(CIPipelineNodeType.LINKED_CI)}
                        />
                    </section>

                    <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                        <p className="m-0 cn-7 fs-11 fw-6 lh-16 dc__uppercase">
                            {WORKFLOW_OPTIONS_MODAL_TYPES.RECIEVE}
                        </p>

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.type}
                            handleCardAction={handleCardAction}
                            disableInfo={getDisabledInfo(CIPipelineNodeType.EXTERNAL_CI)}
                        />

                        {!!LINKED_CD_SOURCE_VARIANT && (
                            <SourceTypeCard
                                title={LINKED_CD_SOURCE_VARIANT.title}
                                subtitle={LINKED_CD_SOURCE_VARIANT.subtitle}
                                image={LINKED_CD_SOURCE_VARIANT.image}
                                alt={LINKED_CD_SOURCE_VARIANT.alt}
                                dataTestId={LINKED_CD_SOURCE_VARIANT.dataTestId}
                                type={LINKED_CD_SOURCE_VARIANT.type}
                                handleCardAction={handleCardAction}
                                disableInfo={getDisabledInfo(CIPipelineNodeType.LINKED_CD)}
                            />
                        )}
                    </section>

                    {window._env_.ENABLE_CI_JOB && (
                        <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                            <p className="m-0 cn-7 fs-11 fw-6 lh-16 dc__uppercase">
                                {WORKFLOW_OPTIONS_MODAL_TYPES.JOB}
                            </p>

                            <SourceTypeCard
                                title={SOURCE_TYPE_CARD_VARIANTS.JOB.title}
                                subtitle={SOURCE_TYPE_CARD_VARIANTS.JOB.subtitle}
                                image={SOURCE_TYPE_CARD_VARIANTS.JOB.image}
                                alt={SOURCE_TYPE_CARD_VARIANTS.JOB.alt}
                                dataTestId={SOURCE_TYPE_CARD_VARIANTS.JOB.dataTestId}
                                type={SOURCE_TYPE_CARD_VARIANTS.JOB.type}
                                handleCardAction={handleCardAction}
                                disableInfo={getDisabledInfo(CIPipelineNodeType.JOB_CI)}
                            />
                        </section>
                    )}
                </div>
            </div>
        </VisibleModal>
    )
}
