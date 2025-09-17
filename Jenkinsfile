pipeline {
    agent  any

    tools {nodejs("node15")}

    environment {
        SONAR_TOKEN = credentials('sonarqube-token')
        SONAR_PROJECT_KEY = "pancake-tags-counter"
        SONAR_HOST_URL = "http://sonarqube-sonarqube.security-tools.svc.cluster.local:9000"
        SONAR_HOME = tool "sonarqube-scanner"
    }

    stages {
        stage("npm install") {
            steps {
                sh "npm install"
            }
        }

        stage("npm run build") {
            steps {
                sh "npm run build"
            }
        }

        stage("sonar-scanner") {
            steps {
                sh '''
                ${SONAR_HOME}/bin/sonar-scanner \
                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                -Dsonar.sources=. \
                -Dsonar.host.url=${SONAR_HOST_URL} \
                -Dsonar.login=${SONAR_TOKEN}'''
            }
        }
    }
}