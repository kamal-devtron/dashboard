import { MultiValue } from 'react-select'
import { AppDetails } from '../app/types'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'
import { ExternalLink, OptionTypeWithIcon } from './ExternalLinks.type'
import CloudwatchlIcon from '../../assets/icons/ic-cloudwatch.png'
import CoralogixlIcon from '../../assets/icons/ic-coralogix.png'
import DatadogIcon from '../../assets/icons/ic-datadog.png'
import GrafanaIcon from '../../assets/icons/ic-grafana.png'
import KibanaIcon from '../../assets/icons/ic-kibana.png'
import LokiIcon from '../../assets/icons/ic-loki.png'
import NewrelicIcon from '../../assets/icons/ic-newrelic.png'
import AlertsIcon from '../../assets/icons/tools/ic-link-alerts.png'
import BugsIcon from '../../assets/icons/tools/ic-link-bugs.png'
import ChatIcon from '../../assets/icons/tools/ic-link-chat.png'
import ConfluenceIcon from '../../assets/icons/tools/ic-link-confluence.png'
import DocumentIcon from '../../assets/icons/tools/ic-link-document.png'
import FolderIcon from '../../assets/icons/tools/ic-link-folder.png'
import JiraIcon from '../../assets/icons/tools/ic-link-jira.png'
import PerformanceIcon from '../../assets/icons/tools/ic-link-performance.png'
import ReportIcon from '../../assets/icons/tools/ic-link-report.png'
import SwaggerIcon from '../../assets/icons/tools/ic-link-swagger.png'
import WebpageIcon from '../../assets/icons/tools/ic-link-webpage.png'
import { multiSelectStyles } from '../common'

export const MONITORING_TOOL_ICONS = {
    cloudwatch: CloudwatchlIcon,
    coralogix: CoralogixlIcon,
    datadog: DatadogIcon,
    grafana: GrafanaIcon,
    kibana: KibanaIcon,
    loki: LokiIcon,
    newrelic: NewrelicIcon,
    alerts: AlertsIcon,
    bugs: BugsIcon,
    chat: ChatIcon,
    confluence: ConfluenceIcon,
    document: DocumentIcon,
    folder: FolderIcon,
    jira: JiraIcon,
    performance: PerformanceIcon,
    report: ReportIcon,
    swagger: SwaggerIcon,
    webpage: WebpageIcon,
}

export const customMultiSelectStyles = {
    ...multiSelectStyles,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '100%',
    }),
    menuList: (base, state) => ({
        ...base,
        maxHeight: '190px',
        borderRadius: '4px',
        paddingTop: 0,
        paddingBottom: 0,
    }),
    option: (base, state) => ({
        ...base,
        padding: '10px 12px',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
    }),
    control: (base, state) => ({
        ...base,
        width: '160px',
        minHeight: '36px',
        border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
        backgroundColor: 'var(--N50)',
        justifyContent: 'flex-start',
        cursor: 'pointer',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N400)',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        padding: '0 8px',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
}

export const getMonitoringToolIcon = (monitoringTools: MultiValue<OptionTypeWithIcon>, toolId: number): string => {
    return (
        MONITORING_TOOL_ICONS[monitoringTools.find((tool) => tool.value === toolId)?.label.toLowerCase()] ||
        WebpageIcon
    )
}

export const sortByUpdatedOn = (uptA: ExternalLink, uptB: ExternalLink) => {
    return new Date(uptB.updatedOn).getTime() - new Date(uptA.updatedOn).getTime()
}

export const availableVariables = ['{appName}', '{appId}', '{envId}', '{namespace}', '{podName}', '{containerName}']

export const getParsedURL = (
    isAppLevel: boolean,
    url: string,
    appDetails: AppDetails | HelmAppDetails,
    podName?: string,
    containerName?: string,
): string => {
    let parsedUrl = url
        .replace(/{appName}/g, appDetails.appName)
        .replace(/{appId}/g, `${appDetails.appId}`)
        .replace(/{envId}/g, `${appDetails.environmentId}`)
        .replace(/{namespace}/g, appDetails.namespace)

    if (!isAppLevel) {
        parsedUrl = parsedUrl.replace(/{podName}/g, podName).replace(/{containerName}/g, containerName)
    }

    return parsedUrl
}

export const onImageLoadError = (e) => {
    if (e && e.target) {
        e.target.src = WebpageIcon
    }
}
