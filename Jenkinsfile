pipeline {
    agent any

    tools {
        nodejs("node15")
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        skipDefaultCheckout()
    }

    environment {
        SONAR_TOKEN = credentials('sonarqube-token')
        SONAR_PROJECT_KEY = "pancake-tags-counter"
        SONAR_HOST_URL = "http://sonarqube-sonarqube.security-tools.svc.cluster.local:9000"
        SONAR_HOME = tool "sonarqube-scanner"
        TRIVY_SERVER = "trivy.security-tools.svc.cluster.local:4954"
        DOCKER_REGISTRY = "khimnguynn"
        IMAGE_NAME = "pancake-tags-counter"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..7]}"
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE_NAME = "${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
    }

    stages {
        stage("Checkout") {
            steps {
                echo "Starting pipeline execution..."
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Git Commit: ${GIT_COMMIT[0..7]}"
                echo "Image Tag: ${IMAGE_TAG}"
                echo "Full Image Name: ${FULL_IMAGE_NAME}"
                checkout scm
            }
        }

        stage("Sonar Scanner") {
            steps {
                echo "Running SonarQube analysis..."
                withSonarQubeEnv('sonarqube') { 
                    sh '''
                    ${SONAR_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                    -Dsonar.sources=. \
                    -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }

        stage("Quality Gate") {
            steps {
                echo "Waiting for SonarQube Quality Gate..."
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("Build Container Image") {
            agent { 
                kubernetes {
                    defaultContainer 'kaniko'
                    yamlFile 'pod-template.yaml'
                }
            }

            steps {
                echo "Building container image with Kaniko..."
                echo "Building image: ${FULL_IMAGE_NAME}"
                container('kaniko') {
                    withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
                        sh '''#!/busybox/sh
                        echo "Checking Dockerfile..."
                        ls -la `pwd`/Dockerfile
                        echo "Starting Kaniko build for versioned image..."
                        /kaniko/executor --context `pwd` \
                        --dockerfile `pwd`/Dockerfile \
                        --destination ${FULL_IMAGE_NAME}
                        echo "Building latest tag..."
                        /kaniko/executor --context `pwd` \
                        --dockerfile `pwd`/Dockerfile \
                        --destination ${LATEST_IMAGE_NAME}
                        echo "Container images built successfully!"
                        echo "Versioned image: ${FULL_IMAGE_NAME}"
                        echo "Latest image: ${LATEST_IMAGE_NAME}"
                        '''
                    }
                }
            }
        }

        stage("Security Scan with Trivy") {
            agent { 
                kubernetes {
                    defaultContainer 'trivy'
                    yaml '''
kind: Pod
spec:
  containers:
  - name: trivy
    image: aquasec/trivy:latest
    command:
    - sleep
    args:
    - 99d
'''
                } 
            }
            steps {
                echo "Running Trivy security scan..."
                echo "Scanning image: ${FULL_IMAGE_NAME}"
                container('trivy') {
                    sh '''
                    echo "Scanning versioned image for security vulnerabilities..."
                    trivy image --server http://${TRIVY_SERVER} \
                    --format table \
                    ${FULL_IMAGE_NAME} --scanners secret
                    echo "Scanning latest image for security vulnerabilities..."
                    trivy image --server http://${TRIVY_SERVER} \
                    --format table \
                    ${LATEST_IMAGE_NAME} --scanners secret
                    echo "Security scan completed for both images!"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed!"
            script {
                def versionedImage = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                def latestImage = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:latest"
                echo "Final image tags:"
                echo "  - Versioned: ${versionedImage}"
                echo "  - Latest: ${latestImage}"
            }
            cleanWs()
        }
        success {
            echo "Pipeline executed successfully! ✅"
            script {
                def versionedImage = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                def latestImage = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:latest"
                echo "Images pushed to registry:"
                echo "  - ${versionedImage}"
                echo "  - ${latestImage}"
            }
        }
        failure {
            echo "Pipeline failed! ❌"
        }
        unstable {
            echo "Pipeline is unstable! ⚠️"
        }
    }
}