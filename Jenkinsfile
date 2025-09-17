pipeline {
    agent  any

    tools {nodejs("node15")}

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
    }
}