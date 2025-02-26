pipeline {
    agent any
    environment {
        APP_DIR = 'app-devops-bootcamp'
        K8S_DIR = 'k8s-devops-bootcamp'

        APP_REPO = 'https://github.com/bartodes/app-devops-bootcamp.git'
        K8S_REPO = 'https://github.com/bartodes/k8s-devops-bootcamp.git'
        
        REGISTRY = 'bartodes/api-store'
        IMG_TAG = "0.0.${env.BUILD_NUMBER}"
        DOCKER_IMG = "${REGISTRY}:${IMG_TAG}"

        NODEJS_ID = 'nodejs:18.15.0'
        DOCKER_CRED_ID = 'dockerhub'
        GIT_CRED_ID = 'github'

        ISSUE_TITLE = "Error en el build: ${env.BUILD_ID}"
        ISSUE_BODY_FILE = 'issue-body.txt'
    }
    stages {
        stage('Clone'){
            steps {
                echo 'Cloning...'
                sh "git clone ${APP_REPO}"
            }
        }
        stage('Test'){
            steps {
                nodejs(nodeJSInstallationName: "${NODEJS_ID}"){
                    echo 'Testing app for building stage...'
                    sh """
                    cd ${APP_DIR}/api-store
                    npm install
                    npm run test
                    """
                }
            }
            post {
                failure {
                    nodejs(nodeJSInstallationName: "${NODEJS_ID}"){
                        sh "npm audit > ${ISSUE_BODY_FILE}"
                        withCredentials([
                            usernamePassword(credentialsId: "${GIT_CRED_ID}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')
                        ]){
                            sh """
                            echo ${GIT_TOKEN} > tmpToken.txt
                            gh auth login --with-token < tmpToken.txt
                            gh issue create -t '${ISSUE_TITLE}' -F ${ISSUE_BODY_FILE} -R ${K8S_REPO}
                            """
                        }
                    }
                }
            }
        }
        stage('Docker Build'){
            steps {
                echo "Building Docker Image..."
                sh "docker build -t ${DOCKER_IMG} ./${APP_DIR}/api-store"
            }
        }
        stage('Image Scan'){
            steps {
                echo "Searching for Vulnerabilities in the Image..."
                withCredentials([string(credentialsId: 'snyk-api-token', variable: 'SNYK_TOKEN')]){
                    sh 'snyk auth $SNYK_TOKEN'
                    sh "snyk container test $DOCKER_IMG --json --severity-threshold=low "
                    sh "snyk container monitor $DOCKER_IMG --severity-threshold=low  --project-name=$IMG_TAG"
                }
            }
        }
        stage('Docker Push'){
            steps {
                echo "Pushing Docker Image..."
                withCredentials([
                    usernamePassword(credentialsId: "${DOCKER_CRED_ID}", usernameVariable: 'DOCKER_USR', passwordVariable: 'DOCKER_PSSWD')
                ]){
                    sh 'echo -n $DOCKER_PSSWD | docker login -u $DOCKER_USR --password-stdin'
                    sh "docker push ${DOCKER_IMG}"
                }
            }
        }
        stage('K8s Update'){
            steps {
                echo "Updating K8s Manifest..."
                sh"""
                git clone ${K8S_REPO}
                cd ${K8S_DIR}/environments/${env.BRANCH_NAME}
                sed -i 's ${REGISTRY}:.* ${DOCKER_IMG} g' kustomization.yaml
                """
                echo "Pushing K8s Manifest..."
                withCredentials([
                    usernamePassword(credentialsId: "${GIT_CRED_ID}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')
                ]){
                    sh"""
                    git config --global user.email "jenkins@ci.com"
                    git config --global user.name "Jenkins"
                    cd ${K8S_DIR}
                    git add .
                    git commit -m 'jenkins-${env.BUILD_ID}: updated the version of the image to ${IMG_TAG} in dev environment'
                    """
                    sh 'cd $K8S_DIR && git push https://$GIT_USER:$GIT_TOKEN@github.com/$GIT_USER/$K8S_DIR.git'
                }
            }
        }
    }
    post {
        always {
            echo 'Deleting working files...'
            sh"""
            rm -rf ${APP_DIR} ${K8S_DIR}
            docker rmi -f ${DOCKER_IMG}
            """
        }
    }
}