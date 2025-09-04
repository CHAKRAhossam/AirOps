# Build stage
FROM maven:3.9-eclipse-temurin-21 as builder
WORKDIR /app
# Copy files from current directory (config-server)
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the JAR file
COPY --from=builder /app/target/*.jar ./app.jar
# Copy the configuration files to the runtime container
COPY --from=builder /app/src/main/resources/configurations ./configurations
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]