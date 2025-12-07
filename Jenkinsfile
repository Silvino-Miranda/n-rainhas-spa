pipeline {
  agent any
  tools {nodejs "Nodejs"}

  stages {
    stage('Backend Dependencies') {
      steps {
        bat 'cd API-Opcoes-nest && npm i'
      }
    }
    stage('Backend Sonar Analysis') {
      steps {
        bat '"API-Opcoes-nest/Scan - Sonar.bat"'
      }
    }
    stage('Backend Testes') {
      steps {
        bat 'cd "API-Opcoes-nest" && echo implementar'
      }
    }
    stage('Backend Build') {
      steps {
        bat 'cd "API-Opcoes-nest" && npm run build'
      }
    }
  }
}
