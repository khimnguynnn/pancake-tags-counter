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
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: kaniko
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:latest
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
    - name: workspace-volume
      mountPath: /home/jenkins/agent
  volumes:
  - name: kaniko-secret
    secret:
      secretName: regcred
  - name: workspace-volume
    emptyDir: {}
"""
        }
    }
            steps {
                container('kaniko') {
                    script {
                        env.IMAGE_NAME = "khimnguynn/pancake-tags-counter"
                        env.IMAGE_TAG = "latest"
                    }
                    sh """
                    /kaniko/executor \
                    --context $WORKSPACE \
                    --dockerfile $WORKSPACE/Dockerfile \
                    --destination $IMAGE_NAME:$IMAGE_TAG \
                    --docker-config=/kaniko/.docker
                    """
                }
            }
        }
    }
}