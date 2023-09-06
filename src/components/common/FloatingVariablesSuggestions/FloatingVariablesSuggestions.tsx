import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import Tippy from '@tippyjs/react'
import { GenericEmptyState, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import DebouncedSearch from '../DebouncedSearch/DebouncedSearch'
import { FloatingVariablesSuggestionsProps, RenderSuggestionsItemProps } from './types'
import { ReactComponent as ICDrag } from '../../../assets/icons/drag.svg'
import { ReactComponent as ICGridView } from '../../../assets/icons/ic-grid-view.svg'
import { ReactComponent as ICClose } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Clipboard } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as ICSearch } from '../../../assets/icons/ic-search.svg'
import NoResults from '../../../assets/img/empty-noresult@2x.png'

//TODO: Fix the case for no matching variable found
export default function FloatingVariablesSuggestions({
    zIndex,
    loading,
    variables,
    reloadVariables,
    error,
}: FloatingVariablesSuggestionsProps) {
    const [isActive, setIsActive] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [clearSearch, setClearSearch] = useState(false)
    // In case of StrictMode, we get error findDOMNode is deprecated in StrictMode
    // So we use useRef to get the DOM node
    const nodeRef = useRef(null)
    const enableSearch = !loading && !error && variables?.result?.length

    useEffect(() => {
        setSuggestions(variables?.result || [])
    }, [variables?.result, isActive])

    const handleActivation = () => {
        setIsActive(true)
    }

    const handleDeActivation = (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
        e.stopPropagation()
        setIsActive(false)
    }

    const onSearch = (text: string) => {
        const filteredSuggestions = (variables?.result || []).filter((variable) =>
            variable.variableName.toLowerCase().includes(text.toLowerCase()),
        )
        setSuggestions(filteredSuggestions)
    }

    const handleClearSearch = () => {
        setClearSearch(!clearSearch)
    }

    const renderVariableItem = ({
        variableName,
        variableDescription,
        variableValue,
    }: RenderSuggestionsItemProps): JSX.Element => (
        <Tippy className="default-tt" content={variableValue} placement="left" key={variableName}>
            <div className="flexbox-col pt-8 pb-8 pl-12 pr-12 dc__align-self-stretch bcn-0 dc__border-bottom-n1">
                <div className="flexbox dc__align-items-center dc__gap-2">
                    <p className="m-0 fs-13 fw-6 lh-20 cn-9">
                        {'{{'}
                        {variableName}
                        {'}}'}
                    </p>

                    <div className="icon-dim-16 ml-8">
                        <Clipboard onClick={() => {}} className="icon-dim-16 cursor" />
                    </div>
                </div>

                <div className="flexbox dc__align-items-center">
                    <p className="m-0 dc__ellipsis-right__2nd-line fs-12 fw-4 lh-18">{variableDescription}</p>
                </div>
            </div>
        </Tippy>
    )

    const renderHeader = () => (
        <div className="flexbox-col dc__align-self-stretch">
            <div className="handle-drag flexbox pt-8 pl-12 pr-12 dc__gap-16 dc__align-start dc__align-self-stretch bcn-7 dc__grabbable">
                <div className="flexbox-col dc__content-center dc__align-start flex-grow-1 dc__no-shrink">
                    <p className="m-0 cn-0 fs-13 fw-6 lh-20 dc__align-self-stretch">Scoped variables</p>

                    <p className="dc__align-self-stretch c-n50 fs-12 fw-4 lh-20">Use variable to set dynamic value</p>
                </div>

                <ICClose className="fcn-0 icon-dim-20 cursor" onClick={handleDeActivation} />
            </div>

            {enableSearch && (
                <div className="flexbox dc__align-self-stretch pt-8 pb-8 pl-12 pr-12 bcn-0">
                    <DebouncedSearch
                        onSearch={onSearch}
                        placeholder="Search variables"
                        containerClass="flexbox flex-grow-1 pt-8 pb-8 pl-10 pr-10 dc__gap-8 dc__align-self-stretch dc__align-items-center bc-n50 dc__border dc__border-radius-4-imp"
                        inputClass="flex-grow-1 dc__no-border dc__outline-none-imp bc-n50 lh-20 fs-13 cn-5 fw-4 p-0"
                        debounceTimeout={500}
                        Icon={ICSearch}
                        iconClass="icon-dim-16"
                        clearSearch={clearSearch}
                    >
                        {/* TODO: Implement Search Clear */}
                    </DebouncedSearch>
                </div>
            )}
        </div>
    )

    const renderButton = (): JSX.Element => (
        <button
            className="dc__outline-none-imp flexbox mw-56 pt-5 pb-5 pl-12 pr-12 dc__gap-8 dc__align-items-center dc__border-radius-8-imp dc__border bcn-0 cb-5 fs-12 fw-6 lh-18 dc__align-center mb-12"
            onClick={handleClearSearch}
        >
            Clear Search
        </button>
    )

    const renderSuggestions = (): JSX.Element => {
        return (
            <>
                <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1">
                    {/* FIXME: May have to stringify the value */}
                    {suggestions?.length ? (
                        suggestions.map((variable) =>
                            renderVariableItem({
                                variableName: variable.variableName,
                                variableDescription: variable.variableDescription || 'No Defined Description',
                                variableValue: variable.variableValue.value || 'No Defined Value',
                            }),
                        )
                    ) : (
                        <GenericEmptyState
                            title="No matching variable found"
                            isButtonAvailable
                            image={NoResults}
                            renderButton={renderButton}
                        />
                    )}
                </div>

                <div className="flexbox dc__align-self-stretch dc__align-items-center pt-12 pb-12 pl-10 pr-10 bcv-1 m-0 fs-13 fw-4 lh-20 cn-9">
                    Type &nbsp;<span className="fw-6">{'@{{}}'}</span>&nbsp; to use a variable instead of fixed value.
                </div>
            </>
        )
    }

    const renderBody = (): JSX.Element => {
        if (loading)
            return (
                <div className="flexbox-col dc__align-self-stretch dc__overflow-scroll bcn-0 flex-grow-1">
                    <Progressing pageLoader />
                </div>
            )

        if (!enableSearch) return <Reload reload={reloadVariables} className="bcn-0" />

        return renderSuggestions()
    }

    if (!isActive)
        return (
            <Draggable bounds="body" handle=".handle-drag" nodeRef={nodeRef}>
                <button
                    className="bcn-7 dc__outline-none-imp dc__border-n0 br-48 flex h-40 pt-8 pb-8 pl-12 pr-12 dc__gap-8 dc__no-shrink dc__position-abs"
                    style={{ zIndex, boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.20)' }}
                    onClick={handleActivation}
                    ref={nodeRef}
                >
                    {/* TODO: move logic into function */}
                    <ICDrag
                        className="handle-drag dc__grabbable scn-4 icon-dim-20"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {/* DUMMY ICON */}
                    <ICGridView className="scn-0 icon-dim-20" />
                </button>
            </Draggable>
        )

    return (
        <Draggable bounds="body" handle=".handle-drag" nodeRef={nodeRef}>
            <div
                className="flex column dc__no-shrink w-356 dc__content-space dc__border-radius-8-imp dc__border-n7 dc__overflow-hidden dc__position-abs mxh-504"
                style={{
                    zIndex,
                    boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.25)',
                }}
                ref={nodeRef}
            >
                <>
                    {renderHeader()}
                    {renderBody()}
                </>
            </div>
        </Draggable>
    )
}
