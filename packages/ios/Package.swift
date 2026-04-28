// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ApiSpendingWidget",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "SpendingCore", targets: ["SpendingCore"]),
    ],
    targets: [
        .target(name: "SpendingCore", path: "ApiSpendingWidget/Sources/Core"),
    ]
)
