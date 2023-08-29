import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import Descriptor from './Descriptor'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ButtonWithLoader } from '../common'
import { postScopedVariables, getScopedVariablesJSON, parseYAMLStringToObj, parseIntoYAMLString } from './utils/helpers'
import { ScopedVariablesEditorI } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import {
    PARSE_ERROR_TOAST_MESSAGE,
    SAVE_ERROR_TOAST_MESSAGE,
    SAVE_SUCCESS_TOAST_MESSAGE,
    GET_SCOPED_VARIABLES_ERROR,
} from './constants'

const ScopedVariablesEditor = ({
    variablesData,
    name,
    abortRead,
    reloadScopedVariables,
    jsonSchema,
    setShowEditView,
    setScopedVariables,
}: ScopedVariablesEditorI) => {
    const [editorData, setEditorData] = useState(variablesData)
    const [savedScopedVariables, setSavedScopedVariables] = useState(null)
    const [showSaveView, setShowSaveView] = useState<boolean>(false)
    const [loadingSavedScopedVariables, setLoadingSavedScopedVariables] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const handleSave = async () => {
        let variablesObj: { variables: any[] }
        try {
            variablesObj = parseYAMLStringToObj(editorData)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                toast.error(PARSE_ERROR_TOAST_MESSAGE)
                return
            }
        } catch (e) {
            toast.error(PARSE_ERROR_TOAST_MESSAGE)
            return
        }
        try {
            setIsSaving(true)
            const res = await postScopedVariables(variablesObj)
            if (+res?.code === 200) {
                if (setShowEditView) {
                    setShowEditView(false)
                } else {
                    abortRead()
                }
                toast.success(SAVE_SUCCESS_TOAST_MESSAGE)
                setScopedVariables(null)
                reloadScopedVariables()
            } else {
                toast.error(SAVE_ERROR_TOAST_MESSAGE)
            }
        } catch (e) {
            toast.error(SAVE_ERROR_TOAST_MESSAGE)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReview = async () => {
        let variablesObj: { variables: any[] }
        try {
            variablesObj = parseYAMLStringToObj(editorData)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                toast.error(PARSE_ERROR_TOAST_MESSAGE)
                return
            }
        } catch (e) {
            toast.error(PARSE_ERROR_TOAST_MESSAGE)
            return
        }

        try {
            setLoadingSavedScopedVariables(true)
            const res = await getScopedVariablesJSON()
            if (+res?.code === 200) {
                setShowSaveView(true)
                if (res?.result?.payload) {
                    setSavedScopedVariables(parseIntoYAMLString(res?.result?.payload))
                } else {
                    setSavedScopedVariables(null)
                }
            } else {
                toast.error(GET_SCOPED_VARIABLES_ERROR)
                setShowSaveView(false)
            }
        } catch (e) {
            toast.error(GET_SCOPED_VARIABLES_ERROR)
            setShowSaveView(false)
        } finally {
            setLoadingSavedScopedVariables(false)
        }
    }

    const handleEditorChange = (value: string) => {
        setEditorData(value)
    }

    const handleAbort = () => {
        if (showSaveView) {
            setScopedVariables(savedScopedVariables ? parseYAMLStringToObj(savedScopedVariables) : null)
        }
        if (setShowEditView) {
            setShowEditView(false)
            return
        }
        abortRead()
    }

    return (
        <div className="flex column dc__content-space h-100 default-bg-color">
            <Descriptor />
            <div className="uploaded-variables-editor-background">
                <div className="uploaded-variables-editor-container">
                    <div className="uploaded-variables-editor-infobar">
                        {setShowEditView ? (
                            <p className="uploaded-variables-editor-infobar__typography dc__ellipsis-right">
                                {showSaveView ? 'Review' : 'Edit'} <span style={{ fontWeight: 700 }}>Variables</span>
                            </p>
                        ) : (
                            <p className="uploaded-variables-editor-infobar__typography dc__ellipsis-right">
                                Upload{' '}
                                <span style={{ fontWeight: 700 }}>{name?.split('.').slice(0, -1).join('.')}</span>
                            </p>
                        )}

                        <Tippy
                            className="default-tt"
                            arrow
                            placement="top"
                            content={
                                <div>
                                    <div className="flex column left">Close</div>
                                </div>
                            }
                        >
                            <button className="uploaded-variables-editor-infobar__abort-read-btn" onClick={handleAbort}>
                                <Close width="20px" height="20px" />
                            </button>
                        </Tippy>
                    </div>

                    <CodeEditor
                        mode="yaml"
                        value={editorData}
                        noParsing={false}
                        diffView={showSaveView}
                        defaultValue={savedScopedVariables || ''}
                        height="100%"
                        onChange={handleEditorChange}
                        validatorSchema={jsonSchema}
                    />

                    <div className="uploaded-variables-editor-footer">
                        <button className="uploaded-variables-editor-footer__cancel-button" onClick={handleAbort}>
                            Cancel
                        </button>

                        <ButtonWithLoader
                            rootClassName="uploaded-variables-editor-footer__save-button cta"
                            onClick={showSaveView ? handleSave : handleReview}
                            loaderColor="white"
                            isLoading={showSaveView ? isSaving : loadingSavedScopedVariables}
                            disabled={showSaveView ? isSaving : loadingSavedScopedVariables}
                        >
                            {showSaveView ? 'Save' : 'Review'}
                        </ButtonWithLoader>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScopedVariablesEditor
