# ==========================================
# STAGE 1: Build JAR with Maven & Java 21
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copy Maven descriptor and download dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2: Lightweight Runtime Container
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root application user
RUN addgroup -S sporta && adduser -S sporta -G sporta

# Copy built JAR from builder
COPY --from=builder /build/target/*.jar app.jar

# Ensure proper permissions
RUN chown -R sporta:sporta /app

USER sporta
EXPOSE 8387

# JVM memory flags optimized for VPS
ENV JAVA_OPTS="-Xms512m -Xmx1536m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
