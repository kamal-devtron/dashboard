import yaml from 'js-yaml'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { ValidatorT } from '../types'
import {
    EMPTY_FILE_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    PARSE_ERROR_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
    ROUTES,
} from '../constants'

export const validator: ValidatorT = ({ data, type }) => {
    if (!data) {
        return EMPTY_FILE_STATUS
    }
    switch (type) {
        case 'application/json':
            try {
                const parsedData = JSON.parse(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: true,
                        message: {
                            data: yaml.safeDump(parsedData),
                            description: 'File uploaded successfully',
                        },
                    }
                }
                return PARSE_ERROR_STATUS
            } catch (e) {
                return JSON_PARSE_ERROR_STATUS
            }
        case 'application/x-yaml':
        case 'application/yaml':
        case 'text/yaml':
        case 'text/x-yaml':
            try {
                const parsedData = yaml.safeLoad(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: true,
                        message: {
                            data: yaml.safeDump(parsedData),
                            description: 'File uploaded successfully',
                        },
                    }
                }
                return PARSE_ERROR_STATUS
            } catch (e) {
                return YAML_PARSE_ERROR_STATUS
            }
        default:
            return FILE_NOT_SUPPORTED_STATUS
    }
}

export const downloadData = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}

export const parseIntoYAMLString = (data: any) => {
    return yaml.safeDump(data)
}

export const parseYAMLStringToObj = (data: string) => {
    return yaml.safeLoad(data)
}

// WARNING: This function intends to be used inside a try-catch block as variablesObj can have any type
export const manipulateVariables = (manipulator, variablesObj) => {
    const mutatedVariablesObj = JSON.parse(JSON.stringify(variablesObj))
    mutatedVariablesObj.variables.forEach((variable) => {
        variable.attributeValue.forEach((attributes) => {
            attributes.variableValue.value = manipulator(attributes.variableValue.value)
        })
    })
    return mutatedVariablesObj
}

export const sortVariables = (variablesObj: object): object => {
    /*
        Approach:
        Sorting is going to happen on multiple levels:
        a) Variable name is going to be unique so we will first sort, variablesObj.variables.definition.varName
        b) After that we will sort based on attributeType, variables.attributeValue.attributeType
        c) If the attributeType is same, we sorting will be on different cases:
            i) if attributeType is ApplicationEnv then we will first variables.attributeValue.attributeType.attributeParams.ApplicationName, then variables.attributeValue.attributeType.attributeParams.EnvName,
    */
    return {}
}

// Services
export const getScopedVariablesJSON = () => {
    return get(ROUTES.GET_SCOPED_VARIABLES_JSON)
}

export const postScopedVariables = (data: any) => {
    return post(ROUTES.SCOPED_VARIABLES, data)
}
