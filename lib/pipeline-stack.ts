import * as codecommit from "aws-cdk-lib/aws-codecommit"
import {
	CodeBuildOptions,
	CodeBuildStep,
	CodePipeline,
	CodePipelineSource,
} from "aws-cdk-lib/pipelines"
import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { WorkshopPipelineStage } from "./pipeline-stage"

export class WorkshopPipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id)

		const repo = new codecommit.Repository(this, "WorkshopRepo", {
			repositoryName: "WorkshopRepo",
		})

		const synthStep = new CodeBuildStep("SynthStep", {
			input: CodePipelineSource.codeCommit(repo, "main"),
			installCommands: ["npm i -g aws-cdk"],
			commands: ["npm ci", "npm run build", "npx cdk synth"],
		})

		const pipeline = new CodePipeline(this, "Pipeline", {
			pipelineName: "WorkshopPipeline",
			synth: synthStep,
		})

		const deploy = new WorkshopPipelineStage(this, "Deploy")
		const deployStage = pipeline.addStage(deploy)

		const TEST_NAME_1 = "TestViewerEndpoint" as const
		const stepTestViewerURL = new CodeBuildStep(TEST_NAME_1, {
			projectName: TEST_NAME_1,
			envFromCfnOutputs: {
				ENDPOINT_URL: deploy.hcViewerUrl,
			},
			commands: ["curl -Ssf $ENDPOINT_URL"],
		})

		const TEST_NAME_2 = "TestAPIGatewayEndpoint" as const
		const stepTestAPIEndpoint = new CodeBuildStep(TEST_NAME_2, {
			projectName: TEST_NAME_2,
			envFromCfnOutputs: {
				ENDPOINT_URL: deploy.hcEndpoint,
			},
			commands: [
				"curl -Ssf $ENDPOINT_URL",
				"curl -Ssf $ENDPOINT_URL/hello",
				"curl -Ssf $ENDPOINT_URL/test",
			],
		})

		// esto es para probar sobre instancias ya creadas
		deployStage.addPost(stepTestViewerURL, stepTestAPIEndpoint)
	}
}
