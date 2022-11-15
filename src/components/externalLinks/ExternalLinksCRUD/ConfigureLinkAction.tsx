import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { Checkbox, CHECKBOX_VALUE } from '../../common'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as QuestionIcon } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help.svg'
import { ConfigureLinkActionType, ExternalLinkScopeType, OptionTypeWithIcon } from '../ExternalLinks.type'
import { customMultiSelectStyles } from '../ExternalLinks.utils'
import { customOptionWithIcon, customValueContainerWithIcon, ToolsMenuList } from '../ExternalLinks.component'
import { RadioGroup, RadioGroupItem } from '../../common/formFields/RadioGroup'
import TippyWhite from '../../common/TippyWhite'
import IdentifierSelector from './IdentifierSelector'

export default function ConfigureLinkAction({
    index,
    link,
    clusters,
    allApps,
    selectedIdentifiers,
    toolGroupedOptions,
    showDelete,
    onToolSelection,
    handleLinksDataActions,
}: ConfigureLinkActionType): JSX.Element {
    const [linkScope, setLinkScope] = useState<ExternalLinkScopeType>(link.type || ExternalLinkScopeType.AppLevel)

    const getErrorLabel = (field: string, type?: string): JSX.Element => {
        const errorLabel = (label: string): JSX.Element => {
            return (
                <div className="error-label flex left dc__align-start fs-11 mt-4">
                    <div className="error-label-icon">
                        <Error className="icon-dim-20" />
                    </div>
                    <div className="ml-4 cr-5">{label}</div>
                </div>
            )
        }
        switch (field) {
            case 'tool':
                return errorLabel('Please select monitoring tool')
            case 'name':
                return errorLabel('Please provide name for the tool you want to link')
            case 'identifiers':
                return errorLabel(`Please select one or more ${type}`)
            case 'url':
                return errorLabel('Please enter URL template')
            case 'invalidProtocol':
                return errorLabel('The url should start with http:// or https://')
            default:
                return <></>
        }
    }

    const onNameChange = (e) => {
        handleLinksDataActions('onNameChange', index, e.target.value)
    }

    const onDescriptionChange = (e) => {
        handleLinksDataActions('onDescriptionChange', index, e.target.value)
    }

    const onEditableFlagToggle = () => {
        handleLinksDataActions('onEditableFlagToggle', index, !link.isEditable)
    }

    const onUrlTemplateChange = (e) => {
        handleLinksDataActions('onUrlTemplateChange', index, e.target.value)
    }

    const deleteLinkData = (key) => {
        handleLinksDataActions('delete', key)
    }

    const handleLinkScope = (e) => {
        setLinkScope(e.target.value)
        handleLinksDataActions('onScopeChange', index, e.target.value)
    }

    const handleToolSelection = (selected: OptionTypeWithIcon) => {
        onToolSelection(index, selected)
    }

    return (
        <div id={`link-action-${index}`} className="configure-link-action-wrapper">
            <div className="link-monitoring-tool mb-8">
                <ReactSelect
                    placeholder="Select"
                    name={`monitoring-tool-${index}`}
                    value={link.tool}
                    options={toolGroupedOptions}
                    isMulti={false}
                    isSearchable={false}
                    hideSelectedOptions={false}
                    onChange={handleToolSelection}
                    components={{
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        Option: customOptionWithIcon,
                        ValueContainer: customValueContainerWithIcon,
                        MenuList: ToolsMenuList,
                    }}
                    styles={{
                        ...customMultiSelectStyles,
                        menuList: (base, state) => ({
                            ...customMultiSelectStyles.menuList(base, state),
                            padding: '14px',
                        }),
                        menu: (base, state) => ({
                            ...customMultiSelectStyles.menu(base, state),
                            width: '144px',
                            marginTop: '0',
                        }),
                        option: (base, state) => ({
                            ...customMultiSelectStyles.option(base, state),
                            backgroundColor: state.isSelected
                                ? 'var(--B100)'
                                : state.isFocused
                                ? 'var(--N100)'
                                : 'white',
                            color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                        }),
                        control: (base, state) => ({
                            ...customMultiSelectStyles.control(base, state),
                            minHeight: '36px',
                            width: '40px',
                            border: 'none',
                            backgroundColor: 'white',
                            boxShadow: 'none',
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: '0',
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: 'var(--N500)',
                        }),
                        dropdownIndicator: (base, state) => ({
                            ...customMultiSelectStyles.dropdownIndicator(base, state),
                            padding: '0',
                            svg: {
                                width: '16px',
                                height: '16px',
                            },
                        }),
                    }}
                />
                {link.invalidTool && getErrorLabel('tool')}
            </div>
            <div className="configure-link-action-content">
                <div className="link-name">
                    <input placeholder="Link name" value={link.name} onChange={onNameChange} />
                    {link.invalidName && getErrorLabel('name')}
                </div>
                <div className="link-text-area">
                    <textarea
                        rows={1}
                        placeholder="Description"
                        value={link.description}
                        onChange={onDescriptionChange}
                    />
                </div>
                <div className="link-scope flex left">
                    <label className="mr-16">Show link in:</label>
                    <RadioGroup
                        className="external-link-scope__radio-group"
                        value={linkScope}
                        name={`external-link-scope-${index}`}
                        onChange={handleLinkScope}
                    >
                        <RadioGroupItem value={ExternalLinkScopeType.AppLevel}>
                            <span
                                className={`dc__no-text-transform ${
                                    linkScope === ExternalLinkScopeType.AppLevel ? 'fw-6' : 'fw-4'
                                }`}
                            >
                                Specific applications
                            </span>
                        </RadioGroupItem>
                        <RadioGroupItem value={ExternalLinkScopeType.ClusterLevel}>
                            <span
                                className={`dc__no-text-transform ${
                                    linkScope === ExternalLinkScopeType.ClusterLevel ? 'fw-6' : 'fw-4'
                                }`}
                            >
                                All apps in specific clusters
                            </span>
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
                <IdentifierSelector
                    index={index}
                    link={link}
                    selectedIdentifiers={selectedIdentifiers}
                    clusters={clusters}
                    allApps={allApps}
                    handleLinksDataActions={handleLinksDataActions}
                    getErrorLabel={getErrorLabel}
                />
                <div className="link-text-area">
                    <label>URL Template*</label>
                    <textarea
                        rows={1}
                        placeholder="Link or URL template"
                        value={link.urlTemplate}
                        onChange={onUrlTemplateChange}
                    />
                    {link.invalidUrlTemplate && getErrorLabel('url')}
                    {link.invalidProtocol && getErrorLabel('invalidProtocol')}
                </div>
                <div className="flex left">
                    <Checkbox
                        isChecked={link.isEditable}
                        rootClassName="link-admin-scope mb-0-imp"
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={onEditableFlagToggle}
                    >
                        <span className="fs-13 fw-4 lh-20 cn-9">App admins can edit</span>
                    </Checkbox>
                    <TippyWhite
                        className="w-300"
                        placement="top"
                        Icon={HelpIcon}
                        iconClass="fcv-5"
                        heading="Who can edit this link?"
                        infoText="If allowed, this link will be visible in app configurations. Application admins and managers will be able to edit this link."
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                    </TippyWhite>
                </div>
            </div>
            {showDelete && (
                <div className="link-delete cursor">
                    <CloseIcon className="icon-dim-20 fcn-6" onClick={() => deleteLinkData(index)} />
                </div>
            )}
        </div>
    )
}
