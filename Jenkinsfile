pipeline {
    agent  any

    tools {nodejs("node15")}

    environment {
        SONAR_TOKEN = credentials('sonarqube-token')
        SONAR_PROJECT_KEY = "pancake-tags-counter"
        SONAR_HOST_URL = "http://sonarqube-sonarqube.security-tools.svc.cluster.local:9000"
        SONAR_HOME = tool "sonarqube-scanner"
        TRIVY_SERVER = "trivy.security-tools.svc.cluster.local:4954"
    }

    stages {
        stage("sonar-scanner") {
            steps {
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
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("build container image with kaniko") {
            agent { 
                kubernetes {
                    defaultContainer 'kaniko'
                    yamlFile 'pod-template.yaml'
                }
            }

            steps {
                container('kaniko') {
                    withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
                    sh '''#!/busybox/sh
                    ls -la `pwd`/Dockerfile
                    /kaniko/executor --context `pwd` \
                    --dockerfile `pwd`/Dockerfile \
                    --destination khimnguynn/pancake-tags-counter:latest
                    '''
                    }

                }
            }
        }

        stage("Scan security code with trivy") {
            agent { kubernetes {
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
            } }
            steps {
                container('trivy') {
                    sh '''
                    trivy image --server http://${TRIVY_SERVER} \
                    --format table \
                    khimnguynn/pancake-tags-counter:latest
                    '''
                }
            }
        }
    }
}