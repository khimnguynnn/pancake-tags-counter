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
    }

    stages {
        stage("Checkout") {
            steps {
                echo "Starting pipeline execution..."
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
                container('kaniko') {
                    withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
                        sh '''#!/busybox/sh
                        echo "Checking Dockerfile..."
                        ls -la `pwd`/Dockerfile
                        echo "Starting Kaniko build..."
                        /kaniko/executor --context `pwd` \
                        --dockerfile `pwd`/Dockerfile \
                        --destination khimnguynn/pancake-tags-counter:latest
                        echo "Container image built successfully!"
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
                container('trivy') {
                    sh '''
                    echo "Scanning image for security vulnerabilities..."
                    trivy image --server http://${TRIVY_SERVER} \
                    --format table \
                    khimnguynn/pancake-tags-counter:latest --scanners secret
                    echo "Security scan completed!"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed!"
            cleanWs()
        }
        success {
            echo "Pipeline executed successfully! ✅"
        }
        failure {
            echo "Pipeline failed! ❌"
        }
        unstable {
            echo "Pipeline is unstable! ⚠️"
        }
    }
}