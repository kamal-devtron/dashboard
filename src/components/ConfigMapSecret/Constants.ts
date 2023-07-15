export const EXTERNAL_TYPES = {
    '': 'Kubernetes ConfigMap',
    KubernetesConfigMap: 'Kubernetes External ConfigMap',
}

export const EXTERNAL_INFO_TEXT = {
    secret: {
        title: 'Mount Existing Kubernetes Secret',
        infoText:
            'Secret will not be created by system. However, they will be used inside the pod. Please make sure that secret with the same name is present in the environment.',
    },
    configmap: {
        title: 'Using External Configmaps',
        infoText:
            'Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment',
    },
}
