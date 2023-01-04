import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { Progressing } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { CLUSTER_SELECT_STYLE } from '../Constants'
import { K8SResourceListType } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import ReactSelect from 'react-select'
import { Option } from '../../../components/v2/common/ReactSelect.utils'
import '../ResourceBrowser.scss'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { toast } from 'react-toastify'
import { EventList } from './EventList'

export function K8SResourceList({
    selectedResource,
    resourceList,
    filteredResourceList,
    setFilteredResourceList,
    noResults,
    clusterOptions,
    selectedCluster,
    onChangeCluster,
    namespaceOptions,
    selectedNamespace,
    setSelectedNamespace,
    resourceListLoader,
    getResourceListData,
    updateNodeSelectionData,
}: K8SResourceListType) {
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const { clusterId, namespace, nodeType, node } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)

    useEffect(() => {
        setSearchText('')
    }, [selectedResource?.gvk.Kind])

    useEffect(() => {
        if (resourceList?.headers.length) {
            /*
          116 is standard with of every column for calculations
          295 is width of left nav + sidebar
          200 is the diff of name column
          */

            const appliedColumnDerivedWidth = resourceList.headers.length * 116 + 295 + 200
            const windowWidth = window.innerWidth
            let clientWidth = 0
            setFixedNodeNameColumn(windowWidth < clientWidth || windowWidth < appliedColumnDerivedWidth)
        }
    }, [resourceList?.headers])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = resourceList.data.filter(
            (resource) =>
                resource.name?.indexOf(_searchText) >= 0 ||
                resource.namespace?.indexOf(_searchText) >= 0 ||
                resource.status?.indexOf(_searchText) >= 0 ||
                resource.message?.indexOf(_searchText) >= 0 ||
                resource['involved object']?.indexOf(_searchText) >= 0 ||
                resource.source?.indexOf(_searchText) >= 0 ||
                resource.reason?.indexOf(_searchText) >= 0,
        )
        setFilteredResourceList(_filteredData)
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }

    const handleClusterChange = (selected): void => {
        onChangeCluster(selected)
    }

    const handleNamespaceChange = (selected): void => {
        setSelectedNamespace(selected)
        push({
            pathname: location.pathname.replace(`/${namespace}/`, `/${selected.value}/`),
        })
    }

    const handleResourceClick = (e) => {
        const { name, tab } = e.target.dataset
        const _url = `${url.split('/').slice(0, -1).join('/')}/${nodeType}/${name}${tab ? `/${tab.toLowerCase()}` : ''}`

        const isAdded = AppDetailsStore.addAppDetailsTab(nodeType, name, _url)

        if (isAdded) {
            updateNodeSelectionData(
                resourceList.data.find((resource) => resource.name === name || resource.name === node),
            )
            push(_url)
        } else {
            toast.error(
                <div>
                    <div>Max 5 tabs allowed</div>
                    <p>Please close an open tab and try again.</p>
                </div>,
            )
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space pt-16 pr-20 pb-12 pl-20">
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedResource?.gvk?.Kind || ''}`}
                        value={searchText}
                        className="search__input"
                        onChange={handleOnChangeSearchText}
                        onKeyDown={handleFilterKeyPress}
                    />
                    {searchApplied && (
                        <button className="search__clear-button" type="button" onClick={clearSearch}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                </div>
                <div className="flex">
                    <ReactSelect
                        className="w-220"
                        placeholder="Select Cluster"
                        options={clusterOptions}
                        value={selectedCluster}
                        onChange={handleClusterChange}
                        styles={CLUSTER_SELECT_STYLE}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                    {selectedResource?.namespaced && (
                        <ReactSelect
                            placeholder="Select Namespace"
                            className="w-220 ml-8"
                            options={namespaceOptions}
                            value={selectedNamespace}
                            onChange={handleNamespaceChange}
                            styles={CLUSTER_SELECT_STYLE}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderResourceRow = (resourceData: Record<string, any>, index: number): JSX.Element => {
        return (
            <div
                key={`${resourceData.name}-${index}`}
                className="dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover"
            >
                {resourceList.headers.map((columnName) =>
                    columnName === 'name' ? (
                        <div
                            className={`w-300 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? ' bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flex left">
                                <div className="w-280 pr-4 dc__ellipsis-right">
                                    <a
                                        className="dc__link cursor"
                                        data-name={resourceData.name}
                                        onClick={handleResourceClick}
                                    >
                                        {resourceData.name}
                                    </a>
                                </div>
                                <ResourceBrowserActionMenu
                                    clusterId={clusterId}
                                    namespace={namespace}
                                    resourceData={resourceData}
                                    selectedResource={selectedResource}
                                    getResourceListData={getResourceListData}
                                    handleResourceClick={handleResourceClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`dc__inline-block dc__ellipsis-right mr-16 pt-12 pb-12 w-100-px ${
                                columnName === 'status'
                                    ? ` app-summary__status-name f-${resourceData[columnName]?.toLowerCase()}`
                                    : ''
                            }`}
                        >
                            {resourceData[columnName]}
                        </div>
                    ),
                )}
            </div>
        )
    }

    const renderEmptyPage = (): JSX.Element => {
        if (noResults) {
            return (
                <ResourceListEmptyState
                    subTitle={`We could not find any ${selectedResource?.gvk?.Kind}. Try selecting a different cluster${
                        selectedResource.namespaced ? ' or namespace.' : '.'
                    }`}
                />
            )
        } else {
            return (
                <ResourceListEmptyState
                    title="No matching results"
                    subTitle={`We could not find any matching ${selectedResource?.gvk?.Kind}.`}
                    actionHandler={clearSearch}
                />
            )
        }
    }

    const renderList = (): JSX.Element => {
        if (filteredResourceList.length === 0) {
            return renderEmptyPage()
        } else {
            if (selectedResource?.gvk.Kind === 'Event') {
                return <EventList filteredData={filteredResourceList} />
            }
            return (
                <div style={{ width: 'calc(100vw - 293px)', overflow: 'auto hidden' }}>
                    <div
                        className=" fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase"
                        style={{ width: 'max-content', minWidth: 'calc(100vw - 292px)' }}
                    >
                        {resourceList.headers.map((columnName) => (
                            <div
                                className={`h-36 list-title dc__inline-block mr-16 pt-8 pb-8 dc__ellipsis-right ${
                                    columnName === 'name'
                                        ? `${
                                              fixedNodeNameColumn
                                                  ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right'
                                                  : ''
                                          } w-300 pl-20`
                                        : 'w-100-px'
                                }`}
                            >
                                {columnName}
                            </div>
                        ))}
                    </div>
                    {filteredResourceList?.map((clusterData, index) => renderResourceRow(clusterData, index))}
                </div>
            )
        }
    }

    return (
        <div
            className={`resource-list-container dc__border-left ${
                filteredResourceList.length === 0 ? 'no-result-container' : ''
            }`}
        >
            {renderSearch()}
            {resourceListLoader ? <Progressing pageLoader /> : renderList()}
        </div>
    )
}
