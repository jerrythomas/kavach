<page
	class="flex flex-col flex-grow overflow-hidden w-full md:w-200 md:mx-auto md:pb-10 md:px-5 justify-between"
>
	<content class="flex flex-col flex-grow overflow-y-auto">
		<slot name="content" />
	</content>
	<actions class="flex w-full">
		<slot name="actions" />
	</actions>
</page>
