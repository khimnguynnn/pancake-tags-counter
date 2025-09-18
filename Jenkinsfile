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
        // stage("npm install") {
        //     steps {
        //         sh "npm install"
        //     }
        // }

        // stage("npm run build") {
        //     steps {
        //         sh "npm run build"
        //     }
        // }

        // stage("sonar-scanner") {
        //     steps {
        //         withSonarQubeEnv('sonarqube') { 
        //             sh '''
        //             ${SONAR_HOME}/bin/sonar-scanner \
        //             -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        //             -Dsonar.sources=. \
        //             -Dsonar.login=${SONAR_TOKEN}
        //             '''
        //         }
        //     }
        // }

        // stage("Quality Gate") {
        //     steps {
        //         timeout(time: 10, unit: 'MINUTES') {
        //             waitForQualityGate abortPipeline: true
        //         }
        //     }
        // }

        stage("build container image with kaniko") {
            agent { kubernetes {
        defaultContainer 'kaniko'
        yaml '''
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    imagePullPolicy: Always
    command:
    - sleep
    args:
    - 99d
    volumeMounts:
      - name: aws-secret
        mountPath: /root/.aws/
      - name: docker-registry-config
        mountPath: /kaniko/.docker
  volumes:
    - name: aws-secret
      secret:
        secretName: aws-secret
    - name: docker-registry-config
      configMap:
        name: docker-registry-config
'''
   } }

            steps {
                container('kaniko') {
                    sh '''
                    /kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --destination khiemnd/pancake-tags-counter:latest
                    '''
                }
            }
        }
    }
}