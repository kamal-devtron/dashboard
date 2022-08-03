import React from 'react';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import ReactSelect, { components } from 'react-select';
import { DropdownIndicator, ValueContainer } from './charts.util';
import { Checkbox, Option, multiSelectStyles, } from '../common';
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg';
import { ReactComponent as Grid } from '../../assets/icons/ic-grid-view.svg'
import { ReactComponent as List } from '../../assets/icons/ic-list-view.svg'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import { QueryParams } from './charts.util';
import { Accordian } from '../common/Accordian/Accordian';
import { URLS } from '../../config';

function ChartHeaderFilter({ selectedChartRepo, handleCloseFilter, includeDeprecated, chartRepoList, setSelectedChartRepo, appStoreName, setAppStoreName, searchApplied, isGrid, setIsGrid }) {
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { url } = match

    const handleSelection = (event) => {
        const chartRepoList = selectedChartRepo.filter((e) => e != event)
        setSelectedChartRepo(chartRepoList)
        selectedChartRepo.length === chartRepoList.length
            ? handleFilterChanges([event, ...selectedChartRepo], 'chart-repo')
            : handleFilterChanges(chartRepoList, 'chart-repo')
    }

    const handleViewAllCharts = () => {
        history.push(`${match.url.split('/chart-store')[0]}${URLS.GLOBAL_CONFIG_CHART}`)
    }

    function handleFilterChanges(selected, key): void {
        const searchParams = new URLSearchParams(location.search);
        const app = searchParams.get(QueryParams.AppStoreName);
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId);

        if (key == "chart-repo") {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            history.push(`${url}?${qs}`)
        };

        if (key == "deprecated") {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            history.push(`${url}?${qs}`);
        }

        if (key == "search") {
            selected.preventDefault();
            let qs = `${QueryParams.AppStoreName}=${appStoreName}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            history.push(`${url}?${qs}`);
        }

        if (key == "clear") {
            let qs: string = "";
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            history.push(`${url}?${qs}`);
        }
    }

    const setStore = (event) => {
        setAppStoreName(event.target.value)
    }

    const clearFilterChange = (e) => {
        handleFilterChanges(e, 'clear')
    }

    const setGrid = () => {
        setIsGrid(true)
    }

    const setList = () => {
        setIsGrid(false)
    }

    const toggleDeprecated = () => {
        let value = (includeDeprecated + 1) % 2
        handleFilterChanges(value, 'deprecated')
    }

    return (
        <div className="filter-column-container">
            <div className="pb-12 pl-12 pr-12 pt-16">
                <form onSubmit={(e) => handleFilterChanges(e, 'search')} className="bcn-0 position-rel block en-2 bw-1 br-4 h-36 w-100 position-rel">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search charts"
                        value={appStoreName}
                        className="search__input bcn-0"
                        onChange={setStore}
                    />
                    {searchApplied && (
                        <button
                            className="search__clear-button"
                            type="button"
                            onClick={clearFilterChange}
                        >
                            <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                        </button>
                    )}
                </form>
            </div>
            <div className="pl-12 pr-12 filter-tab">
                <div className="fs-12 fw-6 ml-8 cn-6 pb-8 pt-8">VIEW AS</div>
                <div className="cursor">
                    <div
                        onClick={setGrid}
                        className={`flex left pt-8 pb-8 pl-10 fs-13 ${isGrid ? 'cb-5 bcb-1 scb-5' : ''}`}
                    >
                        <Grid className="icon-dim-20 mr-12" />
                        Grid view
                    </div>
                    <div
                        onClick={setList}
                        className={`flex left pt-8 pb-8 fs-13 pl-10 ${!isGrid ? 'cb-5 bcb-1 scb-5' : ''}`}
                    >
                        <List className="icon-dim-20 mr-12" />
                        List view (Detail)
                    </div>
                </div>
                <hr className="mt-8 mb-8" />
                <div className="fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8">FILTERS</div>
                <Checkbox
                    rootClassName="cursor fs-13 bcn-0 ml-7 mr-10 mb-0 date-align-left--deprecate"
                    isChecked={includeDeprecated === 1}
                    value={'CHECKED'}
                    onChange={toggleDeprecated}
                >
                    <div className="ml-5"> Show deprecated charts</div>
                </Checkbox>
                <hr className="mt-8 mb-8" />
                <Accordian
                    header={'REPOSITORY'}
                    options={chartRepoList}
                    value={selectedChartRepo}
                    onChange={handleSelection}
                    onClickViewChartButton={handleViewAllCharts}
                />
            </div>
        </div>
    )
}

export default ChartHeaderFilter
