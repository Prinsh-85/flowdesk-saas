# Stage 1: Build
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
