pipeline {
    agent any

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
    }

    stages {
        stage("Checkout") {
            steps {
                echo "Starting pipeline execution..."
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    env.FULL_IMAGE_NAME = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Git Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Image Tag: ${env.IMAGE_TAG}"
                echo "Full Image Name: ${env.FULL_IMAGE_NAME}"
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
            steps {
                echo "Building container image with Kaniko..."
                echo "Building image: ${env.FULL_IMAGE_NAME}"
                script {
                    def kanikoPod = kubernetes.pod {
                        yamlFile 'pod-template.yaml'
                    }
                    kanikoPod.inside {
                        withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
                            sh '''#!/busybox/sh
                            echo "Checking workspace contents..."
                            ls -la
                            echo "Checking Dockerfile..."
                            ls -la Dockerfile
                            echo "Starting Kaniko build for versioned image..."
                            /kaniko/executor --context . \
                            --dockerfile ./Dockerfile \
                            --destination ${FULL_IMAGE_NAME}
                            echo "Container image built successfully!"
                            echo "Versioned image: ${FULL_IMAGE_NAME}"
                            '''
                        }
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
                echo "Scanning image: ${env.FULL_IMAGE_NAME}"
                container('trivy') {
                    sh '''
                    echo "Scanning versioned image for security vulnerabilities..."
                    trivy image --server http://${TRIVY_SERVER} \
                    --format table \
                    ${FULL_IMAGE_NAME} --scanners secret
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
                echo "Final image tag:"
                echo "  - Versioned: ${versionedImage}"
            }
            cleanWs()
        }
        success {
            echo "Pipeline executed successfully! ✅"
            script {
                def versionedImage = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                echo "Image pushed to registry:"
                echo "  - ${versionedImage}"
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