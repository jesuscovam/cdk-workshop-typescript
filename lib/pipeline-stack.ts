import * as codecommit from "aws-cdk-lib/aws-codecommit"
import {
	CodeBuildOptions,
	CodeBuildStep,
	CodePipeline,
	CodePipelineSource,
} from "aws-cdk-lib/pipelines"
import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"

export class WorkshopPipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id)

		const repo = new codecommit.Repository(this, "WorkshopRepo", {
			repositoryName: "WorkshopRepo",
		})

		const pipeline = new CodePipeline(this, "Pipeline", {
			pipelineName: "WorkshopPipeline",
			synth: new CodeBuildStep("SynthStep", {
				input: CodePipelineSource.codeCommit(repo, "aws"),
				installCommands: ["npm i -g aws-cdk"],
				commands: ["npm cli", "npm run build", "npx cdk synth"],
			}),
		})
	}
}
